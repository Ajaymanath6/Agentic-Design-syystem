"""Shared AWS → Vertex credentials (same as main.py)."""

from __future__ import annotations

import json
import logging
import os

import boto3
from google.auth import aws as google_auth_aws

logger = logging.getLogger(__name__)


def load_dotenv_llm(agent_root: str | None = None) -> None:
    """Load LLM agent/.env.llm if present (mirrors run.sh)."""
    root = agent_root or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = os.path.join(root, ".env.llm")
    if not os.path.isfile(path):
        return
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, val = line.partition("=")
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            if key:
                os.environ[key] = val

    cred_file = os.environ.get("LLM_AGENT_AWS_CREDENTIALS_FILE", "").strip()
    if cred_file:
        path = os.path.abspath(os.path.expanduser(cred_file))
        os.environ["AWS_SHARED_CREDENTIALS_FILE"] = path


def _apply_aws_session_env(region: str) -> None:
    session = boto3.Session()
    creds = session.get_credentials()
    if creds is None:
        raise RuntimeError(
            "No AWS credentials found. Set LLM_AGENT_AWS_CREDENTIALS_FILE in .env.llm "
            "or use ~/.aws/credentials."
        )
    frozen = creds.get_frozen_credentials()
    os.environ["AWS_ACCESS_KEY_ID"] = frozen.access_key
    os.environ["AWS_SECRET_ACCESS_KEY"] = frozen.secret_key
    if frozen.token:
        os.environ["AWS_SESSION_TOKEN"] = frozen.token
    elif "AWS_SESSION_TOKEN" in os.environ:
        del os.environ["AWS_SESSION_TOKEN"]
    os.environ["AWS_REGION"] = region


def load_vertex_credentials() -> google_auth_aws.Credentials:
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
            'Expected secret key "credential_json" with GCP workload identity JSON'
        )
    return google_auth_aws.Credentials.from_info(
        credential_dict,
        scopes=["https://www.googleapis.com/auth/cloud-platform"],
    )


def vertex_project_and_location() -> tuple[str, str]:
    project = os.environ.get("GCP_PROJECT", "").strip()
    location = os.environ.get("GCP_LOCATION", "us-east4").strip()
    if not project:
        raise RuntimeError("Set GCP_PROJECT in .env.llm")
    return project, location


def make_vertex_embeddings():
    """LangChain embeddings using the same Vertex auth as chat."""
    from langchain_google_vertexai import VertexAIEmbeddings

    project, location = vertex_project_and_location()
    creds = load_vertex_credentials()
    return VertexAIEmbeddings(
        model_name="text-embedding-005",
        project=project,
        location=location,
        credentials=creds,
    )
