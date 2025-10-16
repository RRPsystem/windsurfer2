# Travel Compositor Integration Notes

This document centralizes the key references we need when working with Travel Compositor (TC).

## Base URLs
- Data Base (set in `.env` as `TC_BASE_URL`): `https://online.travelcompositor.com/resources`
- Auth (derived from base origin): `https://online.travelcompositor.com/resources/authentication/authenticate`
- OpenAPI Docs index: https://online.travelcompositor.com/api/documentation/index.xhtml

## Authentication
The local dev proxy (`server/index.js`) auto-fetches a token using the authentication endpoint if `TC_TOKEN` is not provided.

Environment variables in `server/.env`:
```
TC_BASE_URL=https://online.travelcompositor.com/resources
TC_USERNAME=your_user_name
TC_PASSWORD=your_password
TC_MICROSITE_ID=your_microsite_id
PORT=5050
```

Auth cURL (reference):
```bash
curl --location --request POST 'https://online.travelcompositor.com/resources/authentication/authenticate' \
  --header 'Accept-Encoding: gzip' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "username": "your_user_name",
    "password": "your_password",
    "micrositeId": "your_microsite_id"
  }'
```
Response:
```json
{
  "token": "<JWT>",
  "expirationInSeconds": 7200
}
```

## Ideas Endpoints (from OpenAPI)
- List ideas by microsite:
  - GET `/travelidea/{micrositeId}`
- Idea info by ID:
  - GET `/travelidea/{micrositeId}/info/{ideaId}`
- Idea detail (day-to-day) by ID:
  - GET `/travelidea/{micrositeId}/{ideaId}`

Headers:
- `auth-token: <JWT>` (the proxy injects `Authorization: Bearer <JWT>` for you)
- `Accept: application/json`

## Via Local Dev Proxy (recommended for the editor)
Proxy runs at `http://localhost:5050`.

Examples:
- List ideas: `GET http://localhost:5050/api/tc/travelidea/<MICROSITE_ID>`
- Idea info: `GET http://localhost:5050/api/tc/travelidea/<MICROSITE_ID>/info/<IDEA_ID>`
- Idea detail: `GET http://localhost:5050/api/tc/travelidea/<MICROSITE_ID>/<IDEA_ID>`

The proxy:
- Obtains and caches token automatically.
- Adds `Accept: application/json`.
- Adds optional `X-Microsite-Id` header when present.

Note: If you set `TC_BASE_URL` to `/api`, Ideas endpoints will 404 (HTML). Use `/resources` for data endpoints.

## Planned Clean Proxy Routes
Will be added for convenience:
- `GET /api/ideas` → list
- `GET /api/ideas/:id` → detail (day-to-day)
- `GET /api/ideas/:id/info` → info

## Postman Collections
TC provides Postman collections per domain (Accommodation, Closed Tour, etc.) from the docs pages. You can import them into Postman and test with your credentials.

**Download links:**
- Accommodation: https://online.travelcompositor.com/resources/api-accommodation/TravelC_Api_Accommodation.postman_collection.json
- Closed Tour: https://online.travelcompositor.com/resources/api-closedtour/TravelC_Api_ClosedTour.postman_collection.json
- Transport: https://online.travelcompositor.com/resources/api-transport/TravelC_Api_Transports.postman_collection.json
- Ticket: https://online.travelcompositor.com/resources/api-ticket/TravelC_Api_Ticket.postman_collection.json
- Multi-Engine: https://online.travelcompositor.com/resources/api-multi-engine/TravelC_Api_Multi-Engine.postman_collection.json

**Important:** All TC API requests use the `auth-token` header (lowercase with dash), NOT `Authorization: Bearer`

## Notes
- Never commit real credentials. Keep `server/.env` untracked (already in `.gitignore`).
- When moving to Bolt, copy the proxy and `.env` variables there.
