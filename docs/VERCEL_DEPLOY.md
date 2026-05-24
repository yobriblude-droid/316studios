# Deploy 316 Studios on Vercel (full stack)

This app runs **entirely on Vercel** using:

| Layer | Service |
|--------|---------|
| Frontend | Vercel static (Vite `dist/`) |
| API | Vercel Serverless Function (`api/index.ts` → Express) |
| Database | [Turso](https://turso.tech) (SQLite-compatible, serverless) |
| Media uploads | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) |
| Realtime | Disabled on Vercel (notifications use polling + DB) |

Local development still uses `app.db` + filesystem media + Socket.IO.

---

## 1. Create Turso database

```bash
curl -sSfL https://get.tur.so/install.sh | bash
turso auth login
turso db create 316-studios
turso db show 316-studios --url
turso db tokens create 316-studios
```

---

## 2. Create Vercel Blob store

In Vercel Dashboard → Storage → Blob → Create store → connect to project.

Copy `BLOB_READ_WRITE_TOKEN`.

---

## 3. Environment variables (Vercel project)

| Variable | Example |
|----------|---------|
| `JWT_SECRET` | `openssl rand -hex 32` |
| `TURSO_DATABASE_URL` | `libsql://316-studios-xxx.turso.io` |
| `TURSO_AUTH_TOKEN` | token from Turso |
| `BLOB_READ_WRITE_TOKEN` | from Vercel Blob |
| `NODE_ENV` | `production` |
| `INITIAL_ADMIN_EMAIL` | your admin email |
| `INITIAL_ADMIN_PASSWORD` | strong password |
| `VITE_DISABLE_SOCKET` | `true` |

Optional: `GEMINI_API_KEY`

---

## 4. Migrate local data to Turso

On your machine (with existing `app.db`):

```bash
# .env
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...

npm run vercel:seed-turso
npm run seed:patch   # optional: refresh services pricing
```

Or fresh deploy: set `INITIAL_ADMIN_*` and run seed locally, then `vercel:seed-turso`.

---

## 5. Deploy

```bash
npm i -g vercel
vercel link
vercel env pull .env.local
vercel --prod
```

Build uses `npm run vercel-build` (Vite only). API is compiled by Vercel from `api/index.ts`.

---

## 6. After deploy

1. Open `https://your-app.vercel.app/api/health` → should show `{ status: "ok", verso: true, turso: true }`
2. Login admin at `/admin/login`
3. Upload images in admin → stored on Vercel Blob (public URLs in DB)
4. Client requests → admin `/admin/media-requests`

---

## Notes

- **SQLite file (`app.db`) does not work on Vercel** — ephemeral filesystem.
- **Socket.IO** is off on Vercel; live badge uses polling.
- **Existing `/media/...` paths** in seeded data still work if URLs are absolute Blob URLs after re-upload; re-seed or re-upload covers for production.
- **Function limit**: 60s timeout, 1024MB (configured in `vercel.json`).
- **Windows**: `npm run vercel:seed-turso` uses `better-sqlite3` (no `sqlite3` CLI required).

---

## Local dev (unchanged)

```bash
npm run dev
```

Uses `app.db` + local `media/` folder. No Turso required locally unless you set `TURSO_*` in `.env`.
