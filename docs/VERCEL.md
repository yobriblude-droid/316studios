# Deploying Studioverse on Vercel

This app is a **Vite React frontend** plus a **Node/Express API** (SQLite, uploads, Socket.IO). Vercel is ideal for the static site; the API should run on a Node host (Railway, Render, Fly.io, etc.) and connect via environment variables.

## Vercel project settings (Import screen)

| Setting | Value |
|--------|--------|
| **Framework Preset** | Vite |
| **Root Directory** | `./` |
| **Build Command** | `npm run vercel-build` *(or leave default — `vercel.json` sets this)* |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

Do **not** use `npm run build` on Vercel — that also bundles the Express server and is meant for a single Node process, not Vercel’s static output.

## Environment variables (Vercel → Settings → Environment Variables)

Add these for **Production** (and Preview if you use preview deployments):

| Name | Required | Example | Purpose |
|------|----------|---------|---------|
| `API_URL` | **Yes** (for auth/API) | `https://your-app.up.railway.app` | Backend origin; `api/[...slug].ts` proxies `/api/*` here |
| `JWT_SECRET` | On API host only | `openssl rand -hex 32` | Server secret (not needed on Vercel if only static + proxy) |
| `APP_URL` | On API host | `https://studioverse.vercel.app` | OAuth/links; set to your Vercel URL |
| `INITIAL_ADMIN_EMAIL` | On API host | `admin@yourdomain.com` | First admin (production) |
| `INITIAL_ADMIN_PASSWORD` | On API host | *(strong password)* | First admin password |
| `NODE_ENV` | On API host | `production` | Enables secure cookies |
| `GEMINI_API_KEY` | Optional | — | AI features (build-time on Vite if used client-side) |

**Frontend-only (optional):** only if the API is on a **different domain** without the Vercel proxy:

| Name | When |
|------|------|
| `VITE_API_URL` | API on another host and you are **not** using `API_URL` proxy on Vercel |

If `API_URL` is set on Vercel, leave `VITE_API_URL` unset so the browser calls `/api/...` on your Vercel domain (same-origin cookies).

## Recommended architecture

```
Browser → https://studioverse.vercel.app (Vite static + /api proxy)
              ↓ API_URL proxy
         https://your-api.railway.app (Express + SQLite + Socket.IO)
```

### 1. Deploy API (Railway / Render / Fly)

```bash
npm install
npm run build
npm start
```

Set on that service:

- `JWT_SECRET`
- `APP_URL=https://your-project.vercel.app`
- `PORT` (often provided by the platform)
- `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD`
- `NODE_ENV=production`

Persistent disk (or volume) is required for `app.db` and `public/uploads`.

### 2. Deploy frontend on Vercel

1. Import GitHub repo `studioverse` (main).
2. Confirm settings match the table above.
3. Add **`API_URL`** = your backend URL (no trailing slash).
4. Deploy.

### 3. Real-time (Socket.IO)

Socket.IO needs the **backend URL**, not Vercel serverless. In `vercel.json` you can add a rewrite (replace the host):

```json
{
  "rewrites": [
    {
      "source": "/socket.io/:path*",
      "destination": "https://YOUR-BACKEND.up.railway.app/socket.io/:path*"
    }
  ]
}
```

Or set `VITE_API_URL` on Vercel and let the client connect sockets to the backend directly (cookies/credentials must match your CORS setup on Express).

## Local vs production

| | Local (`npm run dev`) | Vercel |
|--|----------------------|--------|
| Frontend | Vite middleware | `dist/` static |
| API | Same server `:3000` | Proxied via `API_URL` |
| Build | `npm run dev` | `npm run vercel-build` → `vite build` |

## Admin login (once hosted)

### 1. Open the admin sign-in page

| Environment | URL |
|-------------|-----|
| **Production (Vercel)** | `https://YOUR-PROJECT.vercel.app/admin/login` |
| **Local** | `http://localhost:3000/admin/login` |

You can also use **Staff login** in the site footer.

### 2. Create your first admin (on the API host)

Admins live in the SQLite database on the **Node backend** (Railway/Render), not on Vercel.

**Option A — env vars on first deploy** (empty database only):

```env
INITIAL_ADMIN_EMAIL=you@yourdomain.com
INITIAL_ADMIN_PASSWORD=your-secure-password-here
INITIAL_ADMIN_NAME=Your Name
NODE_ENV=production
```

Redeploy/restart the API once. The server creates this user when the `users` table is empty.

**Option B — CLI after deploy** (recommended if the DB already exists):

On the API server (SSH, Railway shell, or locally against production `app.db`):

```bash
npm run create-admin -- you@yourdomain.com "YourSecurePassword"
```

### 3. Sign in

1. Confirm Vercel has **`API_URL`** set to your backend.
2. Visit `/admin/login`.
3. Enter the email and password from step 2.
4. You are redirected to `/admin/dashboard`.

### Admin login checklist

- [ ] Backend running (`GET https://YOUR-API/api/health` → `{"status":"ok"}`)
- [ ] Vercel `API_URL` = backend URL (no trailing slash)
- [ ] Admin user created (`create-admin` or `INITIAL_ADMIN_*` on empty DB)
- [ ] `JWT_SECRET` set on API host
- [ ] `NODE_ENV=production` on API host (secure cookies over HTTPS)

If login returns **503**, `API_URL` is missing on Vercel. If **401**, credentials are wrong or the user is not `role: admin`.

## Troubleshooting

- **401 on `/api/auth/me`**: Expected when logged out; ensure `API_URL` points at a running backend.
- **503 from `/api/*`**: `API_URL` missing in Vercel env.
- **Login works locally but not on Vercel**: Set `APP_URL` on the API host to your Vercel URL; use the proxy (`API_URL`) so cookies stay same-site.
- **Uploads fail**: Large uploads may need direct backend URL; increase limits on the Node host.
