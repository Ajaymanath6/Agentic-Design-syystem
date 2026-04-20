"""
Local Vertex AI proxy for layout prompts (Google Method 2: AWS creds + Secrets Manager).

Requires: AWS credentials with secretsmanager:GetSecretValue, secret shape with
credential_json for google.auth.aws.Credentials.

Optional: LLM_AGENT_AWS_CREDENTIALS_FILE → AWS_SHARED_CREDENTIALS_FILE for a daily-updated INI file.
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any

import boto3
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.auth import aws as google_auth_aws
from google.genai.types import HttpOptions
from pydantic import BaseModel, Field, ValidationError

from canvas_html_generate import (
    MAX_HTML_OUTPUT_CHARS,
    build_canvas_html_contents,
    parse_html_generate_response,
)
from layout_html_generate import build_layout_html_contents
from canvas_html_spacing_pass import (
    build_spacing_fix_contents,
    parse_spacing_fix_json,
)
from canvas_plan import (
    CanvasPlanPromptBody,
    build_canvas_plan_contents,
    parse_and_validate_canvas_plan,
)
from layout_plan import (
    LAYOUT_PLAN_SYSTEM,
    LayoutHtmlRequestBody,
    PlanRequestBody,
    load_theme_guide_snippet,
    parse_and_validate_plan,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _bootstrap_aws_credentials_file() -> None:
    """Point boto3 at an AWS CLI-style INI credentials file (e.g. daily-updated path in Downloads)."""
    raw = os.environ.get("LLM_AGENT_AWS_CREDENTIALS_FILE", "").strip()
    if not raw:
        return
    path = os.path.abspath(os.path.expanduser(raw))
    os.environ["AWS_SHARED_CREDENTIALS_FILE"] = path
    if os.path.isfile(path):
        logger.info("Using AWS credentials file from LLM_AGENT_AWS_CREDENTIALS_FILE: %s", path)
    else:
        logger.warning(
            "LLM_AGENT_AWS_CREDENTIALS_FILE set but file not found (boto3 may fail): %s",
            path,
        )


_bootstrap_aws_credentials_file()

app = FastAPI(title="Vertex layout LLM", version="0.1.0")

_cors = os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _cors.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_genai_client: genai.Client | None = None


def _apply_aws_session_env(region: str) -> None:
    session = boto3.Session()
    creds = session.get_credentials()
    if creds is None:
        raise RuntimeError(
            "No AWS credentials found. Set LLM_AGENT_AWS_CREDENTIALS_FILE to an INI file, "
            "or use ~/.aws/credentials / SSO / env vars."
        )
    frozen = creds.get_frozen_credentials()
    os.environ["AWS_ACCESS_KEY_ID"] = frozen.access_key
    os.environ["AWS_SECRET_ACCESS_KEY"] = frozen.secret_key
    if frozen.token:
        os.environ["AWS_SESSION_TOKEN"] = frozen.token
    elif "AWS_SESSION_TOKEN" in os.environ:
        del os.environ["AWS_SESSION_TOKEN"]
    os.environ["AWS_REGION"] = region


def _load_vertex_credentials() -> google_auth_aws.Credentials:
    region = os.environ.get("AWS_REGION", "us-east-1")
    secret_id = os.environ.get(
        "VERTEX_AWS_SECRET_ID", "local/common/vertex-ai-credential"
    )
    _apply_aws_session_env(region)
    sm = boto3.client("secretsmanager", region_name=region)
    raw = sm.get_secret_value(SecretId=secret_id)
    secret_string = raw.get("SecretString")
    if not secret_string:
        raise RuntimeError("Secret has no SecretString")
    outer = json.loads(secret_string)
    if not isinstance(outer, dict):
        raise RuntimeError("Secret JSON must be an object")
    cred_blob = outer.get("credential_json")
    if isinstance(cred_blob, str):
        credential_dict = json.loads(cred_blob)
    elif isinstance(cred_blob, dict):
        credential_dict = cred_blob
    else:
        raise RuntimeError(
            'Expected secret key "credential_json" (string or object) with GCP workload identity JSON'
        )
    return google_auth_aws.Credentials.from_info(
        credential_dict,
        scopes=["https://www.googleapis.com/auth/cloud-platform"],
    )


def get_genai_client() -> genai.Client:
    global _genai_client
    if _genai_client is not None:
        return _genai_client
    project = os.environ.get("GCP_PROJECT", "").strip()
    location = os.environ.get("GCP_LOCATION", "us-east4").strip()
    if not project:
        raise RuntimeError("Set GCP_PROJECT to your Vertex / GCP project id")
    if project in ("your-gcp-project-id", "your-project-id"):
        raise RuntimeError(
            "GCP_PROJECT is still the .env.llm example placeholder. "
            "Set it to your real project ID from Google Cloud Console (IAM & Admin → "
            "Settings, or the project picker). Example: my-team-staging — not the display name."
        )
    creds = _load_vertex_credentials()
    _genai_client = genai.Client(
        credentials=creds,
        http_options=HttpOptions(api_version="v1"),
        vertexai=True,
        project=project,
        location=location,
    )
    logger.info("Vertex genai client initialized (project=%s location=%s)", project, location)
    return _genai_client


SYSTEM_PREFIX = """You are helping design UI layouts for an internal component catalog app.
Rules:
- Only reference components that exist in the published catalog when the user lists them.
- Prefer Tailwind-style utility classes using the brand token prefix brandcolor-* (no raw hex for brand surfaces).
- Be concise: suggest structure, spacing, and component repeats; do not invent HTML unless asked.
"""


class GenerateBody(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=32000)
    systemContext: str | None = Field(
        default=None,
        max_length=32000,
        description="Optional catalog id list or extra constraints from the client.",
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


def _layout_generate_impl(body: GenerateBody) -> dict[str, Any]:
    model = os.environ.get("VERTEX_MODEL", "gemini-2.0-flash-001").strip()
    parts: list[str] = [SYSTEM_PREFIX]
    if body.systemContext:
        parts.append("Catalog context (published component ids / labels):\n")
        parts.append(body.systemContext.strip())
        parts.append("\n\n")
    parts.append("User request:\n")
    parts.append(body.prompt.strip())
    contents = "".join(parts)
    try:
        client = get_genai_client()
    except Exception as e:
        logger.exception("Client init failed")
        raise HTTPException(status_code=503, detail=str(e)) from e
    try:
        response = client.models.generate_content(model=model, contents=contents)
    except Exception as e:
        logger.exception("generate_content failed")
        raise HTTPException(status_code=502, detail=str(e)) from e
    text = getattr(response, "text", None)
    if text is None and getattr(response, "candidates", None):
        # Fallback if SDK shape differs
        try:
            c0 = response.candidates[0]
            text = c0.content.parts[0].text  # type: ignore[attr-defined]
        except (IndexError, AttributeError, TypeError):
            text = None
    if not text:
        raise HTTPException(status_code=502, detail="Empty model response")
    return {"text": text}


@app.post("/layout/generate")
def layout_generate(body: GenerateBody) -> dict[str, Any]:
    """Primary route used by the React app (via Vite proxy)."""
    return _layout_generate_impl(body)


@app.post("/generate")
def generate_alias(body: GenerateBody) -> dict[str, Any]:
    """Alias for tutorials that use POST /generate (same body and response as /layout/generate)."""
    return _layout_generate_impl(body)


def _layout_plan_impl(body: PlanRequestBody) -> dict[str, Any]:
    model = os.environ.get("VERTEX_MODEL", "gemini-2.0-flash-001").strip()
    theme_snippet = load_theme_guide_snippet()
    allow_lines = "\n".join(
        f"- {a}" for a in body.catalogAllowlist[:800] if str(a).strip()
    )
    catalog_section = (
        allow_lines
        or "(no catalog ids sent — output chrome blocks only or set ref to a known id next time)"
    )
    contents = "\n\n".join(
        [
            LAYOUT_PLAN_SYSTEM,
            "Allowed catalog refs (match `ref` to one of these strings):",
            catalog_section,
            "Theme guide JSON (token reference only; never output raw HTML):",
            theme_snippet,
            "User request:",
            body.prompt.strip(),
        ]
    )
    try:
        client = get_genai_client()
    except Exception as e:
        logger.exception("Client init failed")
        raise HTTPException(status_code=503, detail=str(e)) from e
    try:
        response = client.models.generate_content(model=model, contents=contents)
    except Exception as e:
        logger.exception("layout_plan generate_content failed")
        raise HTTPException(status_code=502, detail=str(e)) from e
    text = getattr(response, "text", None)
    if text is None and getattr(response, "candidates", None):
        try:
            c0 = response.candidates[0]
            text = c0.content.parts[0].text  # type: ignore[attr-defined]
        except (IndexError, AttributeError, TypeError):
            text = None
    if not text:
        raise HTTPException(status_code=502, detail="Empty model response")
    try:
        plan = parse_and_validate_plan(text, body.catalogAllowlist)
    except (ValueError, json.JSONDecodeError) as e:
        logger.warning("layout_plan parse/validate failed: %s", e)
        raise HTTPException(
            status_code=422,
            detail=f"Invalid or empty layout plan JSON: {e}",
        ) from e
    return {"plan": plan.model_dump()}


@app.post("/layout/plan")
def layout_plan(body: PlanRequestBody) -> dict[str, Any]:
    """Structured JSON layout plan (catalog + theme keys); used by Admin Layout preview upgrade."""
    return _layout_plan_impl(body)


def _canvas_plan_impl(body: CanvasPlanPromptBody) -> dict[str, Any]:
    model = os.environ.get("VERTEX_MODEL", "gemini-2.0-flash-001").strip()
    contents = build_canvas_plan_contents(body)
    try:
        client = get_genai_client()
    except Exception as e:
        logger.exception("Client init failed")
        raise HTTPException(status_code=503, detail=str(e)) from e
    try:
        response = client.models.generate_content(model=model, contents=contents)
    except Exception as e:
        logger.exception("canvas_plan generate_content failed")
        raise HTTPException(status_code=502, detail=str(e)) from e
    text = getattr(response, "text", None)
    if text is None and getattr(response, "candidates", None):
        try:
            c0 = response.candidates[0]
            text = c0.content.parts[0].text  # type: ignore[attr-defined]
        except (IndexError, AttributeError, TypeError):
            text = None
    if not text:
        raise HTTPException(status_code=502, detail="Empty model response")
    try:
        plan = parse_and_validate_canvas_plan(text)
    except (ValueError, json.JSONDecodeError, ValidationError) as e:
        logger.warning("canvas_plan parse/validate failed: %s", e)
        raise HTTPException(
            status_code=422,
            detail=f"Invalid or empty canvas plan JSON: {e}",
        ) from e
    return {"plan": plan.model_dump(mode="json")}


@app.post("/canvas/plan")
def canvas_plan(body: CanvasPlanPromptBody) -> dict[str, Any]:
    """Structured JSON components-canvas nodes; used by Admin Components canvas AI bar."""
    return _canvas_plan_impl(body)


def _genai_response_text(response: Any) -> str | None:
    text = getattr(response, "text", None)
    if text is None and getattr(response, "candidates", None):
        try:
            c0 = response.candidates[0]
            text = c0.content.parts[0].text  # type: ignore[attr-defined]
        except (IndexError, AttributeError, TypeError):
            text = None
    return text


def _canvas_generate_html_impl(body: CanvasPlanPromptBody) -> dict[str, Any]:
    model = os.environ.get("VERTEX_MODEL", "gemini-2.0-flash-001").strip()
    contents = build_canvas_html_contents(body)
    try:
        client = get_genai_client()
    except Exception as e:
        logger.exception("Client init failed")
        raise HTTPException(status_code=503, detail=str(e)) from e
    try:
        response = client.models.generate_content(model=model, contents=contents)
    except Exception as e:
        logger.exception("canvas_generate_html generate_content failed")
        raise HTTPException(status_code=502, detail=str(e)) from e
    text = _genai_response_text(response)
    if not text:
        raise HTTPException(status_code=502, detail="Empty model response")
    try:
        out = parse_html_generate_response(text, body.prompt)
    except ValueError as e:
        logger.warning("canvas_generate_html parse failed: %s", e)
        raise HTTPException(
            status_code=422,
            detail=f"Invalid or unsafe HTML from model: {e}",
        ) from e
    html = str(out["html"])
    title = str(out["title"])
    if body.spacing_enforcement:
        max_in = int(
            (os.environ.get("CANVAS_HTML_SPACING_PASS_MAX_CHARS") or "14000").strip()
            or "14000"
        )
        if len(html) > max_in:
            logger.warning(
                "spacing enforcement skipped: html length %s > %s",
                len(html),
                max_in,
            )
        else:
            try:
                fix_model = os.environ.get("VERTEX_SPACING_FIX_MODEL", "").strip() or model
                fix_contents = build_spacing_fix_contents(body.prompt, html)
                fix_resp = client.models.generate_content(
                    model=fix_model, contents=fix_contents
                )
                fix_text = _genai_response_text(fix_resp)
                if fix_text:
                    fixed = parse_spacing_fix_json(fix_text, MAX_HTML_OUTPUT_CHARS)
                    if fixed:
                        html = fixed
                    else:
                        logger.warning(
                            "spacing enforcement pass: invalid JSON or html; keeping pass 1"
                        )
            except Exception as e:
                logger.warning("spacing enforcement pass failed: %s", e)
    return {"html": html, "title": title}


@app.post("/canvas/generate-html")
def canvas_generate_html(body: CanvasPlanPromptBody) -> dict[str, Any]:
    """Raw HTML fragment for components canvas creator mode (parallel to /canvas/plan)."""
    return _canvas_generate_html_impl(body)


def _layout_generate_html_impl(body: LayoutHtmlRequestBody) -> dict[str, Any]:
    model = os.environ.get("VERTEX_MODEL", "gemini-2.0-flash-001").strip()
    contents = build_layout_html_contents(body)
    try:
        client = get_genai_client()
    except Exception as e:
        logger.exception("Client init failed")
        raise HTTPException(status_code=503, detail=str(e)) from e
    try:
        response = client.models.generate_content(model=model, contents=contents)
    except Exception as e:
        logger.exception("layout_generate_html generate_content failed")
        raise HTTPException(status_code=502, detail=str(e)) from e
    text = _genai_response_text(response)
    if not text:
        raise HTTPException(status_code=502, detail="Empty model response")
    try:
        out = parse_html_generate_response(text, body.prompt)
    except ValueError as e:
        logger.warning("layout_generate_html parse failed: %s", e)
        raise HTTPException(
            status_code=422,
            detail=f"Invalid or unsafe HTML from model: {e}",
        ) from e
    html = str(out["html"])
    title = str(out["title"])
    if body.spacing_enforcement:
        max_in = int(
            (os.environ.get("CANVAS_HTML_SPACING_PASS_MAX_CHARS") or "14000").strip()
            or "14000"
        )
        if len(html) > max_in:
            logger.warning(
                "spacing enforcement skipped: html length %s > %s",
                len(html),
                max_in,
            )
        else:
            try:
                fix_model = os.environ.get("VERTEX_SPACING_FIX_MODEL", "").strip() or model
                fix_contents = build_spacing_fix_contents(body.prompt, html)
                fix_resp = client.models.generate_content(
                    model=fix_model, contents=fix_contents
                )
                fix_text = _genai_response_text(fix_resp)
                if fix_text:
                    fixed = parse_spacing_fix_json(fix_text, MAX_HTML_OUTPUT_CHARS)
                    if fixed:
                        html = fixed
                    else:
                        logger.warning(
                            "spacing enforcement pass: invalid JSON or html; keeping pass 1"
                        )
            except Exception as e:
                logger.warning("spacing enforcement pass failed: %s", e)
    return {"html": html, "title": title}


@app.post("/layout/generate-html")
def layout_generate_html(body: LayoutHtmlRequestBody) -> dict[str, Any]:
    """Sanitized HTML fragment for layout workspace (parallel to /canvas/generate-html)."""
    return _layout_generate_html_impl(body)
