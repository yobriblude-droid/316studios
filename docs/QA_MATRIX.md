# 316 Studios QA Matrix

## Browsers

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome 120+ | Required | Required |
| Firefox 120+ | Required | — |
| Safari 17+ | Required | iOS Required |
| Edge 120+ | Smoke test | — |

## Critical paths

1. Public: home → projects → project detail → contact
2. Auth: register → login → dashboard
3. Client: approve file, comment (live), media request, invoice checkout
4. Admin: login → CRUD projects/services → client media upload
5. Real-time: two tabs on same file show presence + comment sync
6. Command palette: Ctrl+K navigation
7. Offline: load app once, revisit shell (service worker)

## Performance targets (Phase 6)

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| CLS | < 0.1 |
| TTFB | < 800ms local |

Run Lighthouse on production build: `npm run build && npm start`

## Accessibility

- Skip link focuses main content
- Command palette focus trap
- Notification panel focus trap
- All icons paired with text or aria-label
