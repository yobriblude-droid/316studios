# 316 Studios / Studioverse — Functional Specification

**Brand:** Crimson red accent (`--primary: #dc2626`) — not indigo/purple.

## What was missing (now addressed)

| Gap | Status |
|-----|--------|
| `/dashboard/library` and `/billing` were the same scroll-heavy overview | **Fixed** — dedicated full-page Library and Billing |
| Client portal felt like one long page, not SaaS | **Fixed** — `SaasShell` sidebar + section routes |
| Admin had no unified client inbox | **Fixed** — `/admin/inbox` |
| Purple/indigo accent | **Fixed** — red palette in `index.css` |
| Collaboration dock cluttered overview | **Removed from overview** — use Messages + Inbox |
| Client notification prefs in Account | **Added** |
| Staff de-emphasized | **Moved** to Account link only (not main focus) |

## Still optional (later)

- Blog post rich editor / images upload on posts
- Admin analytics charts
- Client contracts tab
- Email notifications (SMTP)
- Persistent disk on Render for production DB

## Roles & permission matrix

| Capability | Client | Staff | Admin |
|------------|--------|-------|-------|
| Public site (home, projects, services, blog, contact, about) | View | View | View |
| Register / client login | Yes | — | — |
| Client workspace (`/dashboard/*`) | Own data only | — | — |
| Admin panel (`/admin/*`) | — | Per permission | Full |
| Staff login | — | `/admin/login` | `/admin/login` |
| Create staff accounts | — | — | Yes |
| Change own password | Yes | Yes | Yes |
| Edit own profile (name, email) | Yes | Yes | Yes |
| Client ↔ studio messaging | Yes | If `communications` | Yes |
| Blog publish | — | If `blog` | Yes |
| Media uploads (disk library) | — | If `uploads` | Yes |
| Projects / services / hero | — | If `frontend` | Yes |
| Client users & deliverables | — | If `users` | Yes |
| Media requests queue | — | If `requests` | Yes |
| Billing / invoices | View own | If `billing` | Yes |
| Bulk delete (lists) | Own requests | Per area | Yes |

### Staff permissions (set by admin)

- **uploads** — Admin media library, file picker uploads
- **frontend** — Projects, services, hero slides
- **blog** — Blog posts CRUD
- **billing** — Invoices, analytics
- **users** — Client list, per-client media
- **requests** — Media request queue
- **communications** — Reply to client threads

---

## Navigation

### Public navbar (order)

1. **Home** `/`
2. **Services** `/services`
3. **Projects** `/projects`
4. **Blog** `/blog`
5. **Contact** `/contact`
6. **About** `/about`

Auth: Sign in / Register or My Library + Logout. Footer: **Staff login** → `/admin/login`.

### Client workspace (`/dashboard`)

Side nav sections:

| Section | Path | Features |
|---------|------|----------|
| Overview | `/dashboard` | Widgets, stats, quick actions |
| Library | `/dashboard/library` | Files, select-all, bulk download, approve/reject, comments |
| Requests | `/dashboard/requests` | Ingest panel, media requests, bulk remove |
| Messages | `/dashboard/messages` | Communication dock, studio thread |
| Billing | `/dashboard/billing` | Invoices, pay CTA |
| Account | `/dashboard/account` | Profile, email, change password, notification prefs |

### Admin panel (`/admin`)

| Section | Path |
|---------|------|
| Overview | `/admin/dashboard` |
| Projects | `/admin/projects` |
| Services | `/admin/services` |
| Hero slides | `/admin/hero-slides` |
| Media library | `/admin/media` |
| Blog | `/admin/blog` |
| Users | `/admin/users` |
| Requests | `/admin/media-requests` |
| Billing | `/admin/billing` |
| Staff | `/admin/staff` (admin only) |
| Account | `/admin/account` |
| Security | `/admin/security` |

---

## Client — full feature list

- Register, login, logout (JWT cookie)
- Dashboard overview with draggable widgets
- Media library with search, preview, download, approval workflow
- Multi-select + select all + bulk download
- Per-file comments (realtime via Socket.IO when connected)
- Media ingest (files/URLs) → media requests
- Bulk delete own open media requests
- Invoices list, checkout for unpaid
- Bookings (public `/bookings`)
- Notification bell, preferences, dismiss
- Account: update name, change password
- Messages: thread with studio (comments + requests merged)

---

## Admin / staff — full feature list

- Login at `/admin/login` (admin or staff role)
- CRUD projects, services, hero slides (with bulk delete on lists)
- Media library upload/delete (bulk on file picker)
- Client users list → per-user media upload/delete (bulk)
- Media requests: status update, delete (bulk)
- Billing overview
- Blog CRUD + public `/blog`
- Staff management: create staff, assign permissions, reset password (admin only)
- Account profile + security (password)
- Reply to clients in communications when permitted

---

## Communication system

- **Client → studio:** Comments on deliverables, media requests, dedicated Messages section
- **Studio → client:** Admin/staff replies via same thread APIs; notifications on events
- **Route out:** Email/WhatsApp templates from dock (external handoff)

API: `GET/POST /api/client/messages`, `GET/POST /api/admin/messages` (thread per client).

---

## UI changes (this release)

- Home: creative studio landing (hero, services strip, work, blog teaser, CTA)
- Services: compact hero — reduced gap before package grid
- Projects: removed portfolio “collections” gallery block
- Navbar: Home label; About last
- Bulk select + delete on all admin list pages and client requests
