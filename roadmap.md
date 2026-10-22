# Current live admin/member completion
- [ ] Diagnose and repair missing live activation tables with additive migration only; preserve existing accounts and financial records.
- [ ] Exercise authenticated live member/admin reads and safe reversible controls; document each failure and fix confirmed defects.
- [ ] Verify member/admin browser login and central flows against the real server; report financial-policy blockers without changing formulas.

# Member panel and external server
- [ ] Audit the complete re-uploaded marketing/account rules against current code; fix confirmed defects and run fresh isolated PHP/API regression tests. Current audit covers refund carries, source integrity, withdrawal approval and financial release gates; earlier pass counts are historical claims, not current verification.
- [x] Recheck restored original attachment: fixed zero-cap fallback, blocked base Member rank rewards, and made reward replays balance-independent with amount-conflict rejection. Fresh local PHP API suite passes 75/75 checks; no external deployment performed.
- [ ] Resolve matching event/funding policy: current sale+beneficiary key blocks later events for the same beneficiary; carry pairs currently charge the triggering sale rather than resolving earlier source-sale liability. Blocked on approved event identity and funding-source policy; do not guess or deploy.
- [ ] Complete refund reconciliation: invalidate refunded carry and audit source-pair dependencies, pool adjustments, reserve/cap treatment, and historical liabilities. Reserve/cap reinstatement and previously consumed source-pair corrections require Finance approval; current tests prove wallet reversal only, not full reconciliation.
- [x] Restore matching decisions and root placement: fresh-database API suite passes 54/54; local authenticated member page shows matching 150 BDT and remaining balance 270 BDT after later activations and withdrawal. Browser requests forwarded to the real local PHP API; external host remains unverified.
- [x] Earlier audit added source-volume records (lo_volumes + lo_volume_pairs), separate RANK pool spending, allocation records and wallet-refund tests (70/70 at that stage). Original attachment is now restored; this does not establish full refund/source-liability reconciliation. Historical-income reversal solely due to later inactivity remains subject to policy approval.
- [ ] Production financial release: blocked until historical reconciliation and Finance/Admin approval; do not deploy financial changes automatically.
- [x] Configure the supplied XAMPP tunnel URL and add missing-database automatic setup; setup and secure path tests pass.
- [x] Send the approved XAMPP setup update through the signed Master API; all five remote files read back identically, with deployment backups preserved.
- [x] Verify remote database initialization: signed migration and table reads return HTTP 500 with only “Server error”; requires the XAMPP Apache/PHP error log to diagnose.
- [x] Preserve the desktop member-panel layout with proportional screen fitting; all 11 pages passed at 320/393/768/1024/1280px without page overflow, with one-row navigation and mobile profile navigation/input verified in demo mode. Live-account checks remain blocked by the external PHP host.
- [x] Finish mobile dashboard full-width layout and profile label/colon alignment; all 11 member pages verified in demo mode at 320/390/768px, desktop columns preserved. Live-account checks still require the external PHP host.
- [x] Resolve conflicting rank thresholds: user approved first list (Gold/Executive at 1,000; Global Ambassador at 1,500,000); generation 1 is direct sponsor.
- [ ] Build the member panel to match the supplied dashboard kit (kit received through the new share link). [done: dashboard, tree, sponsors, statistics, activation, withdrawals, withdrawals-report, commission, profile, change-password, notice; pending decision: Transaction / Mobile Recharge / Stockiest kit menus]
- [x] Verify statistics/sponsors/activation pages against the kit screenshots in the live preview (demo mode).
- [ ] Connect member login, profile, wallets, reports and trees to the PHP API; verify signed-out access boundaries and authenticated flows.
- [ ] Review old project mechanisms (blocked until an accessible Google Drive connection is available).
- [x] Prepare backendserver PHP REST API and migration-compatible MySQL schema.
- [x] Add audited, restricted deployment and database management with signed updates and rollback.
- [x] Test financial rules, login, access boundaries and server deployment (50/50 checks pass; live-server checks still need host access).

# Clone website
- [x] Copy original pages, styling and photos.
- [x] Add transparent Life OS logo at the top-right of news/event photos and their image viewer.
- [x] Verify pages, image loading, navigation and narrow-screen layout.
- [ ] Add a brand-matched background to Benefits of Life OS.
- [ ] Restore homepage news photos and a visible View more link; verify photo viewing and navigation.

# About and business presentation
- [ ] Add two illustrative senior-management profiles and matching portraits.
- [ ] Replace three expert images and two business-collaboration images.
- [x] Repair corrupted business-opportunity text; keep website content in English.
- [ ] Improve all About subsection layouts across device sizes without changing the theme.
- [ ] Verify updated pages and existing outstanding photo/background tasks.

# Services, galleries and support
- [ ] Refine all service submenu layouts for phones, tablets and desktops.
- [ ] Improve photo/video galleries and add an audio gallery with generated Life OS BD narration.
- [ ] Refine FAQ, Contact Us and Join Us presentation and English content.
- [ ] Generate suitable branded Contact Us and Join Us photographs.
- [ ] Verify requested pages, media controls and responsive layouts.

# Whole-site quality check
- [ ] Apply reference-style global mobile gutters, header/login/search and footer; contain and test every sidebar submenu.
- [ ] Verify GitHub includes all required files and real media while excluding private/generated files.
- [ ] Match supplied mobile reference positioning with a compact header, usable side menu and single-column gallery.
- [ ] Polish both Contact submenu pages (Contact Us and Business Center) within the existing theme.
- [ ] Test every public page across mobile, tablet and desktop widths; repair observed layout and interaction bugs.
- [ ] Verify image viewers, audio playback, video controls, menus, FAQs and enquiry forms.
- [ ] Run regression tests and record remaining external limitations.
## Referral join + ROOT
- [x] Reverify same-side chain placement for Left/Right links, displayed placement IDs, and downline-owned links: fresh isolated PHP suite 75/75, team suite 42/42, link unit tests 2/2; browser registered Left/Right members and confirmed saved placement plus authenticated dashboards. External server not updated; no financial deployment performed.
- [x] Add Left/Right copy links, selected-subtree automatic placement, and reference joining fields; verify against local PHP accounts. (75/75 backend tests, 23/23 team tests; browser: registration via Left and Right links, clipboard copy of both links, auto-placement into first free slot of the chosen subtree, desktop + mobile verified)
- [x] Join page via referral link (auto sponsor + auto placement)
- [x] ROOT button on login page, referral link copy on dashboard
- [ ] Deploy to live server — blocked: live server returns 502 (down)

# Admin panel (/admin)
- [x] Build all 17 admin pages matching the reference kit: login, dashboard (company info), site config, plan & ranks, notices, scroll news, password change, member list, member report, joining report, package activation, balance add, bonus report (ledger), withdrawals, matching events, rank reward, statement close, sales report, rank achievers.
- [x] Verify every page renders with demo data in the browser; exercise withdrawal approve, activation confirm (SUCCESS), rank reward payment, balance add and statement close flows end-to-end in demo mode.
- [x] Dedicated admin banner image (Life OS — Admin Panel) in the admin shell header.
- [ ] Verify admin login and all pages against the live PHP API (deserver.neexthub.site) — blocked: external host returns 502.

## Admin panel — reference recheck (done)
- [x] All 19 admin pages re-screenshotted and compared against the 19 reference screenshots
- [x] Login page restyled to the reference look (green pattern bg, white ADMIN LOGIN box, captcha digit box, Login/Cancel)
- [x] Date columns no longer truncated — compact YYYY-MM-DD HH:mm format (fmtDateShort) in Member List / Member Report
- [x] Reference-style copyright footer bar added to AdminShell (replaced marquee)
- [x] Verified in browser: build OK, no console errors
- [ ] Confirm rank name "Gold/Executive" (1000 matchings) — the plan document labels it this way; rename if it is a typo
- [ ] Live PHP API verification — blocked: deserver.neexthub.site returns 502
