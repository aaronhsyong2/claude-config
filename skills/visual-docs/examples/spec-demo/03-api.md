## API

Two endpoints change. The shapes below are the public contract.

::::tabs
:::tab{title="POST /login"}
```json
{ "email": "jane@acme.co", "password": "••••••••" }
```
Returns `{ accessToken, refreshToken, expiresIn }`.
:::
:::tab{title="POST /refresh"}
```json
{ "refreshToken": "opaque-string" }
```
Rotates the refresh token and returns a fresh pair.
:::
::::

### Diff of the route wiring

```diff
 router.post('/login', login);
-router.get('/session', requireSession);
+router.post('/refresh', refresh);
+router.get('/session', requireAccessToken);
```

:::questions{title="Open Questions"}
1. Refresh rotation: rotate on **every** refresh, or only near expiry? (recommended: every refresh)
2. Do we need device-scoped refresh tokens for "log out other sessions"?
:::
