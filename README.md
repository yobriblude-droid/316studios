# 316 Studios - Portfolio & Client Library

## About
316 Studios is a professional photography studio based in Nairobi, Kenya, specializing in capturing the true essence of human connection. This application serves as a comprehensive digital storefront and client management platform, combining a visually striking portfolio with a secure, private file-delivery system for clients.

## Features

### 1. Public Portfolio
- **Elegant Dark Design:** A modern, moody, and minimalist aesthetic tailored to highlight high-quality visual content.
- **Dynamic Projects Gallery:** Visitors can explore curated collections of photography projects (e.g., Portraits, Weddings, Corporate Headshots) with responsive layouts and fluid animations.
- **Services Showcase:** A dedicated page outlining the studio's pricing packages and offerings.
- **About & Contact:** Information about the studio's origin story and quick ways to get in touch.

### 2. Secure Client Portal
Provide true value to your clients by eliminating third-party file transfer links:
- **Client Dashboard:** A personalized, authenticated dashboard where clients can view an overview of their session, total assets, and pending shoots.
- **Asset Library:** Clients can seamlessly browse, search, and download their high-resolution deliverables, RAW files, and curated selections in one organized space.
- **Contract & Invoice Management:** Integrated tabs to store signed agreements and payment receipts for standard, professional interactions.

## Tech Stack
Our architecture is designed for performance, modularity, and rapid iteration:

- **Frontend:** React 19, TypeScript, React Router DOM
- **Build Tool:** Vite, yielding incredibly fast hot-reloads and optimized static assets.
- **Styling:** Tailwind CSS 4.0 for a utility-first styling experience, coupled with `lucide-react` for beautiful iconography and `motion` for refined micro-interactions.
- **Backend/API:** Node.js + Express (serving as the backend for Authentication and API routes alongside hosting the frontend).
- **Authentication:** `jsonwebtoken` (JWT) and `bcryptjs` for secure password hashing and session management.

## Deploying on Vercel

The UI is deployed as a **Vite static site** (`npm run vercel-build` → `dist`). The Express API (SQLite, uploads, Socket.IO) runs on a Node host; set **`API_URL`** in Vercel to proxy `/api/*` to that backend.

See **[docs/VERCEL.md](docs/VERCEL.md)** for import settings, environment variables, and Railway/Render setup.

## Development

The project is structured as a full-stack Node.js + Vite application where Vite handles the frontend SPA and Express serves as a lightweight API server processing database queries and auth operations.

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (copy `.env.example` to `.env` if required):
   ```bash
   cp .env.example .env
   ```

3. Seed the database from your studio photos in `Media/My Pics/`:
   ```bash
   npm run seed
   # Or replace existing portfolio data:
   npm run seed:force
   ```

4. Start the development server (runs Express + Vite middleware):
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

6. Start production server:
   ```bash
   npm run start
   ```

## License
Copyright © 2024 316 Studios. All Rights Reserved.
