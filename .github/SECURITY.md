# Security Policy

## Supported Versions
We support the latest `main` branch. Use Dependabot to keep dependencies up to date.

## Reporting a Vulnerability
- Please do not open public issues for security reports.
- Email: security@example.com (replace with your team mailbox) or use GitHub Security Advisories (Private report).
- Include reproduction steps, impact, and any logs if available.

## Handling Secrets
- Do not commit secrets. `.gitignore` already excludes `js/config.local.js` and common env files.
- Use GitHub Secrets for CI. Never store secrets in workflows or code.

## CI Security
- CodeQL runs on pushes and PRs to detect code issues.
- Gitleaks scans for leaked credentials.
- Dependabot monitors dependency updates.

## Hardening Recommendations
- Enable GitHub Advanced Security features if available (Secret Scanning, Push Protection, Dependabot alerts).
- Protect `main` with branch protections (see README or org policy):
  - Require PRs, code review, and status checks (CodeQL, Gitleaks) before merge.
  - Require signed commits if your org policy mandates it.
