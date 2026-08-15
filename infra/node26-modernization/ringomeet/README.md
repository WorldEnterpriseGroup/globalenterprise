# RingoMeet Node 26 runtime

This is the rebuilt server surface for RingoMeet. The deployed 2023 bundle had no source-control connection, used IISNode on Windows, hard-coded ACS settings in a server bundle, and shipped an old ACS SDK set. This service keeps the existing browser API contract while moving the server to an explicit Node 26 container and current ACS packages.

The `build/` directory is the recovered browser artifact from the existing app. It is intentionally kept separate from the server rewrite: it is the compatibility surface for the current browser client, while the server now reads `ACS_CONNECTION_STRING`, `ACS_ENDPOINT`, and `ACS_ADMIN_USER_ID` only from runtime secrets.

Required runtime settings:

- `ACS_CONNECTION_STRING`
- `ACS_ENDPOINT`
- `ACS_ADMIN_USER_ID`
- `CORS_ORIGINS` (comma-separated browser origins; defaults to Global Enterprise production origins)

Health endpoints are `/healthz` and `/readyz`. The existing `/token`, `/refreshToken/:id`, `/createThread`, `/addUser/:threadId`, `/getEndpointUrl`, and `/userConfig/:userId` routes remain available for the recovered browser client.
