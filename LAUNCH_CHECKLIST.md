# 🚀 GymFlow Pro — Production Launch Checklist

Follow these steps meticulously before switching the environment to production.

## 1. Environment & Security [CRITICAL]
- [ ] **Google Verification:** Replace the placeholder in `client/index.html` with your actual Google site verification code.
- [ ] **Developer Access:** Verify `meetsutariya.2008@gmail.com` can log in as `superadmin`.
- [ ] **Rotate AI Keys:** Ensure Groq and Gemini keys in `server/.env` are not the free-tier demo keys.
- [ ] **DB URI:** Switch `MONGODB_URI` from `localhost` to your production MongoDB Atlas cluster.
- [ ] **JWT Secrets:** Generate high-entropy strings for `JWT_SECRET` and `JWT_REFRESH_SECRET`.
- [ ] **Client URL:** Set `CLIENT_URL` in `server/.env` to the actual production domain (e.g., `https://app.gymflowpro.com`).
- [ ] **CORS Policy:** Verify that the server only accepts requests from your production client domain.

## 2. Database Initialization
- [ ] **Clean Seed:** Run `npm run seed` to establish the initial gym owner account and base exercise catalog.
- [ ] **Indexes:** Verify `accessPin` in `Member` schema is indexed for fast kiosk lookups.
- [ ] **Backups:** Configure automated daily backups in MongoDB Atlas.

## 3. Kiosk & Terminal Setup
- [ ] **Lockdown Mode:** Verify that the `/member/scan` route is configured for "Full Screen" on the gym's front-desk tablet.
- [ ] **Auto-Refresh:** Ensure the PIN generation interval (30s) is synced between server and terminal.

## 4. UI/UX Verification
- [ ] **Assets:** Run a compression pass on all Lottie files and GIFs in `client/src/assets`.
- [ ] **Dark Mode Sync:** Verify that the "Neural/Matrix" theme renders consistently across both Admin and Member portals.
- [ ] **PWA:** Test the "Install App" functionality on mobile devices to ensure offline-first capability works for digital IDs.

## 5. Deployment
- [ ] **Build Check:** Run `npm run build` in the client and ensure 0 warnings.
- [ ] **SSL:** Verify that HTTPS is active on both frontend and backend endpoints.
- [ ] **Performance:** Run a Lighthouse audit and ensure a score > 90 for Performance and Accessibility.

---
*Date Generated: 2026-05-12*
