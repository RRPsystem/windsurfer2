# wbctx bootstrap profiles

Place per-profile JSON files here to bootstrap compact ctx links.

- Filename: <id>.json (e.g., bolt1.json)
- Served from: https://<your-domain>/wbctx/<id>.json
- Builder deeplink: https://www.ai-websitestudio.nl/index.html?ctx=<id>&edge_badge=0#/mode/<page|news>
- Optional when hosted elsewhere: add ctx_base to URL
  - https://www.ai-websitestudio.nl/index.html?ctx=<id>&ctx_base=https://ctx.your-domain.com&edge_badge=0#/mode/page

## JSON schema

Page example (recommended: include both page_id and slug):
```json
{
  "api": "https://<project>.supabase.co",
  "token": "<JWT with edit scopes>",
  "apikey": "<anon-key>",
  "brand_id": "550e8400-e29b-41d4-a716-446655440001",
  "page_id": "d2f41041-d519-498d-bd4f-9b9df46392bc",
  "slug": "test120",
  "ephemeral": true,
  "exp": 1735689600,
  "sig": "<base64url RS256 signature>",
  "pub": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkq...\n-----END PUBLIC KEY-----"
}
```

News example:
```json
{
  "api": "https://<project>.supabase.co",
  "token": "<JWT with edit scopes>",
  "apikey": "<anon-key>",
  "brand_id": "550e8400-e29b-41d4-a716-446655440001",
  "news_slug": "test34",
  "ephemeral": true,
  "exp": 1735689600,
  "sig": "<base64url RS256 signature>",
  "pub": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkq...\n-----END PUBLIC KEY-----"
}
```

Notes:
- ephemeral: true means builder will NOT store the ctx in localStorage.
- exp: unix seconds, short-lived (e.g., now + 900s).
- sig/pub: optional RS256 signature; builder verifies if provided.

## Security
- Use minimal scopes in JWT.
- Prefer short TTL for tokens and exp.
- Host behind HTTPS only.

## Rotation
- Update token/exp in the JSON to rotate.
- For immediate refresh on devices that cached non-ephemeral ctx, clear localStorage key `wb_ctx_<id>` or use ephemeral=true.
