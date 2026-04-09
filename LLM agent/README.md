# LLM agent — Vertex layout service (Method 2)

FastAPI service that calls **Vertex AI** (`google-genai`) using **AWS credentials** to read **GCP workload credentials** from **AWS Secrets Manager** (Google’s “Method 2: Using google-genai with Local AWS Credentials”).

## Simplest daily workflow (one terminal)

**One-time setup**

1. **Python 3.10+ required** (`google-genai` does not support 3.8/3.9). On **Ubuntu 22.04+**:
   ```bash
   sudo apt update && sudo apt install -y python3.10 python3.10-venv
   ```
   On **Ubuntu 20.04 LTS**, `python3.10` is often missing from default indexes — see [Ubuntu 20.04 (Focal) — Python 3.10](#ubuntu-2004-focal--python-310) below.
2. From `LLM agent/`, run **`./finish-setup-after-apt.sh`** — creates `.venv` and installs `requirements.txt`. (Or do it manually; see script contents.)
3. `cp .env.llm.example .env.llm` (if needed) and edit `.env.llm` (real `GCP_PROJECT`, credentials file path). This file is gitignored.

**Every day**

1. Update the INI credentials file on disk (same path as in `.env.llm`) — **only manual step**.
2. From repo root: **`npm run dev:with-llm`** — starts **Vite + publish helper + LLM agent** together.

If you only need the Python service: **`npm run dev:vertex-llm`** (also loads `.env.llm` via `run.sh`).

## Daily AWS credentials file (INI)

If you rotate keys in a fixed path (e.g. under Downloads), set **`LLM_AGENT_AWS_CREDENTIALS_FILE`** to that file. It must use the same format as `~/.aws/credentials`: a `[profile]` section with `aws_access_key_id`, `aws_secret_access_key`, and optional `aws_session_token`. Use **`AWS_PROFILE`** if the section is not `[default]`.

**Do not commit** that file into this repo.

Example (paths with spaces must be quoted):

```bash
export LLM_AGENT_AWS_CREDENTIALS_FILE="/home/mis/Downloads/aws_credentials (12).txt"
export AWS_PROFILE=default   # or your profile name matching the INI section
export GCP_PROJECT=your-project-id
export AWS_REGION=us-east-1
npm run dev:vertex-llm
```

Each day: **replace the contents** of that file with fresh credentials; the path can stay the same.

## Ubuntu 20.04 (Focal) — Python 3.10

If `apt install python3.10` says **Unable to locate package**, try in order:

**A. Enable `universe` and update**

```bash
sudo add-apt-repository universe
sudo apt update
sudo apt install -y python3.10 python3.10-venv
```

**B. Deadsnakes PPA** (common fix when A still fails)

```bash
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
sudo apt install -y python3.10 python3.10-venv python3.10-dev
```

Then run `./finish-setup-after-apt.sh` from `LLM agent/`.

## Prerequisites

- Python 3.10+
- AWS credentials boto3 can load: either `LLM_AGENT_AWS_CREDENTIALS_FILE`, `~/.aws/credentials`, SSO, or env vars.
- IAM: `secretsmanager:GetSecretValue` on your secret (default id: `local/common/vertex-ai-credential`; override with `VERTEX_AWS_SECRET_ID`).
- Secret `SecretString` JSON must include `credential_json` for `google.auth.aws.Credentials.from_info`.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_AGENT_AWS_CREDENTIALS_FILE` | _(unset)_ | Absolute or `~` path to AWS INI credentials file → sets `AWS_SHARED_CREDENTIALS_FILE` |
| `AWS_PROFILE` | boto default | Profile name inside the INI file |
| `AWS_REGION` | `us-east-1` | Region for Secrets Manager client |
| `VERTEX_AWS_SECRET_ID` | `local/common/vertex-ai-credential` | Secret name or ARN |
| `GCP_PROJECT` | _(required)_ | Vertex / GCP project id |
| `GCP_LOCATION` | `us-east4` | Vertex region |
| `VERTEX_MODEL` | `gemini-2.0-flash-001` | Model id |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Comma-separated origins if not using Vite proxy |
| `THEME_GUIDE_PATH` | _(unset)_ | Optional absolute path to `theme-guide.json`; default is repo `src/config/theme-guide.json` relative to this service |
| `TAILWIND_CONFIG_PATH` | _(unset)_ | Optional absolute path to `tailwind.config.js`; default is repo root `tailwind.config.js`. Used when `POST /canvas/plan` sets `extended_design_context: true`. |

## Install and run

```bash
cd "LLM agent"
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export GCP_PROJECT=your-project-id
uvicorn main:app --host 127.0.0.1 --port 4302 --reload
```

From **repo root**:

```bash
npm run dev:vertex-llm
```

Vite proxies `/api/layout-llm/*` to **4302**. Publish helper uses **4301**.

### Unit tests (no Vertex)

From `LLM agent/` with the project venv activated (or `.venv/bin/python`):

```bash
python -m unittest tests.test_canvas_plan_contents -v
```

## Layout “Ask…” vs Flask-style tutorials

Many guides use **Flask** on port **5000** with `POST /generate`. This project does the same job with **FastAPI** on **4302**:

| Typical Flask tutorial | Here |
|------------------------|------|
| `POST /generate` | `POST /generate` **(alias)** and `POST /layout/generate` **(used by the app)** |
| JSON `{"prompt":"..."}` | Same, plus optional `"systemContext"` (catalog ids from the UI) |
| Return model text | `{ "text": "..." }` (not `{ "response": "..." }`) |
| Browser → backend | **Admin → Layout** “Ask…” → instant heuristic preview; in parallel `callLayoutPlan` → `POST /api/layout-llm/layout/plan` (structured JSON). Legacy free-text: `callLayoutGenerate` → `/layout/generate` (optional / tutorials). |

You do **not** need a second Flask server. Use **`npm run dev:with-llm`** once Python 3.10+, `.env.llm`, and AWS/Vertex access are set up.

## Verification checklist

1. **Service up:** `curl -sS http://127.0.0.1:4302/health` → `{"status":"ok"}` (after `npm run dev:vertex-llm` or `npm run dev:with-llm`).
2. **Generate:** `curl` `POST /layout/generate` or `POST /generate` with `{"prompt":"Hi"}` → JSON with `"text"`.
3. **UI:** **Admin → Layout** → **Ask…** → send → quick catalog match first (single component + repeat/grid), then **Structured preview** (stacked blocks, optional **row** / **split** from the planner) when `/layout/plan` succeeds; inline warning if the planner fails (heuristic preview remains).

## API

- `GET /health` — liveness
- `POST /layout/plan` — JSON `{ "prompt": string, "catalogAllowlist": string[] }` → `{ "plan": LayoutPlanV1 }` (validated JSON). **Block types:** `chrome`, `catalog`, **`row`** (2–4 columns; each column is a list of chrome/catalog leaves only), **`split`** (`variant: sidebarMain`, `sidebar` + `main` leaf lists, optional `sidebarPlacement` start|end, `sidebarWidth` narrow|default|wide). Catalog refs must match allowlist; invalid nested refs dropped. Rows with fewer than two non-empty columns flatten to a vertical leaf list. Optional **`defaultAfterGap`** and per-block **`afterGap`**: `tight` | `default` | `section` | `hero` (see `src/config/theme-guide.json` → `spacing`). Client infers spacing between top-level blocks (row/split adjacent to catalog/chrome uses `default`; `section` between row↔split or catalog→chrome unless overridden). **Canvas handoff (future):** the same plan JSON can be saved and used to seed Admin canvas blocks or an import flow — not automated in the UI yet.
- `POST /layout/generate` — JSON `{ "prompt": string, "systemContext"?: string }` → `{ "text": string }` (free-text; tutorials / optional)
- `POST /generate` — same request/response as `/layout/generate` (alias for docs/tutorials)
- `POST /canvas/plan` — JSON `{ "prompt": string, "messages"?: { "role": "user"|"assistant", "content": string }[], "extended_design_context"?: boolean }` → `{ "plan": CanvasPlanV1 }` (components canvas). **Backward compatible:** `prompt` only matches the previous behavior. **Multi-turn:** optional `messages` is prior transcript (server formats as “Conversation”); `prompt` is always the latest user turn. **`extended_design_context: true`** attaches the full `tailwind.config.js` (truncated if huge) and a larger `theme-guide.json` slice; default `false` keeps the short in-prompt Tailwind summary only (higher token use when true).

## curl

```bash
curl -sS -X POST http://127.0.0.1:4302/layout/plan \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Form with title Contact and subtitle Details, then case card","catalogAllowlist":["case-card","CaseCardComponent"]}'
```

```bash
curl -sS -X POST http://127.0.0.1:4302/layout/generate \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Suggest a 3-column layout using only promo-card."}'
```

Alias (Flask-style path):

```bash
curl -sS -X POST http://127.0.0.1:4302/generate \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Say hello in one sentence."}'
```
