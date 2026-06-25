## Data model

The only new table is `refresh_token`. Access tokens are not stored.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | FK → `user.id` |
| `token_hash` | text | SHA-256 of the opaque token |
| `expires_at` | timestamptz | 30 days |
| `revoked_at` | timestamptz | nullable |

### File map

:::file-tree
- src/
  - auth.ts — *issue + verify tokens (new)*
  - routes.ts — *wire /login, /refresh*
- db/
  - migrations/004_refresh_token.sql — *new table*
:::

### Annotated implementation

:::annotated-code{file=src/auth.ts lang=ts}
- 3-6: config constants — the 15-minute access TTL lives here
- 9-14: `issueTokens` signs the access JWT and returns both tokens
- 17: refresh tokens are hashed before they ever touch the DB
:::
