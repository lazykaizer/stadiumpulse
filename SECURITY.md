# Security Policy

## Reporting a Vulnerability
If you discover a security issue, please open a private security advisory via GitHub's "Security" tab on this repository, or contact [security@stadiumpulse.example.com].

## Threat Model & Mitigations

- **Input validation**: every API endpoint validates input with Pydantic v2 (backend) before processing; no untyped data reaches core logic.
- **Rate limiting**: 60 requests/minute per client via slowapi.
- **Prompt injection defense**: user-influenced text (e.g. uploaded filenames, any free-text fields) is sanitized and never interpolated raw into the Gemini prompt.
- **File upload safety**: MIME-type validation and a 10 MB file size limit on all uploads.
- **Secrets management**: no API keys or credentials are committed to the repository; local development uses `.env` (gitignored); production uses to be finalized at deployment time via Google Secret Manager or Cloud Run environment configuration.
- **No authentication surface**: this is a direct-access control-room tool with no user accounts, so there are no credentials to leak or account-takeover surface.
- **Automated scanning**: GitHub CodeQL runs on every push and weekly; `pip-audit` and `npm audit` run in CI; Gitleaks scans for accidentally committed secrets.
