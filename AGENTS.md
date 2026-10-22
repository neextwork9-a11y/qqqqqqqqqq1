<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Preserve the TanStack bootstrap and pinned dependencies when importing content pages; source package scripts are not executed.
- Keep existing source-controlled media as real files and resolve them through shared media helpers so GitHub sync remains self-contained.
- Render news/event photo branding through BrandedPhoto for both thumbnails and image viewers so logo fitting and stacking stay consistent.
- Keep About presentation overrides in a shared browser-safe module and scope layout adjustments to About pages, so imported source content and other pages remain unchanged.
- Keep support-page copy and presentation overrides in a browser-safe support module, leaving the imported source archive intact.
- Mobile navigation uses explicitly toggled, vertically scrolling submenus within the shared reference header; shared mobile-shell overrides have greater specificity than imported desktop rules to prevent off-screen menus.
- Store generated narration as shared media and replay it with native audio controls; playback must not generate another recording.
- Contact and joining enquiries prepare email drafts with explicit status messages, rather than claiming unsent forms have been delivered.
- backendserver/ is a standalone PHP+MySQL service: nested transactions must go through DB::tx (savepoint-safe); never call PDO beginTransaction directly inside another transaction.
- Master Worker requests are HMAC-signed over "{ts}.{METHOD}.{path-with-query}.{sha256(body)}"; the signature path must include the query string in both signer and verifier.
- Run backend tests with the API up (`php -S 127.0.0.1:8090 -t backendserver backendserver/index.php`) then `php backendserver/tests/run_tests.php` against a fresh lifeos MySQL database loaded from backendserver/database/*.sql.
- Matching decisions use a row-existence query rather than scalar null checks because PDO fetchColumn returns false for a missing row; both tree bills belong to one beneficiary decision per sale.
- Every consumed binary/enrollment volume unit records its source sale in lo_volumes and its pair in lo_volume_pairs (decision-keyed); carries must never lose source identity, so audits can trace any payout back to the sale that funded it.
- Rank reward references are scoped to their beneficiary and validated under the pool lock before balance checks; this keeps replay safe after funds change and prevents changed-amount requests from appearing paid.
- Member routes use a separate scoped reference shell and client-hydrated PHP bearer session; private account queries run only after the server validates the session, so public pages and SSR contain no member financial data.
- The member API base uses VITE_LIFEOS_API_URL with an external-host fallback; the optional relative development prefix still uses the Vite proxy.
- PHP database initialization and signed migration requests share Migrations::apply; legacy dump initialization executes additive structure only to preserve existing accounts and avoid destructive resets.
- Send external PHP updates with scripts/master-update.py using an environment-only HMAC key; never expose privileged deployment through a browser endpoint.
- Package all database migrations automatically; scoped live updates must use the updater's explicit file selection so missing schema cannot silently break activation.
- Enforce admin feature switches and withdrawal limits through PanelPolicy on the PHP API; browser controls reflect member-safe settings but never replace server validation.
- Master file paths resolve through their canonical existing ancestor with normalized Windows separators; this permits missing XAMPP files without allowing traversal or symlink escapes.
- Member profile changes use the existing user_profiles table and locked user row, preserving the source legacy schema rather than replacing it.
- Fit the member portal through a single measured desktop canvas in the shared MemberShell; scale the whole canvas rather than adding mobile reflow rules, so every page preserves reference proportions.
- New members must register through a sponsor referral link (except the very first account); the company ROOT member is created via the signed /api/master/root/ensure call so its password never sits in code.
- Referral team previews are advisory; registration recomputes placement under a shared transaction-held lock and never trusts a submitted placement parent, preserving subtree isolation under concurrent joins.
- Explicit team links traverse only the selected child pointer from the sponsor; keep legacy no-team placement separate so team registrations cannot spill into the opposite side.
- Extended registration fields stay in the legacy users/user_profiles tables through additive migrations, keeping existing accounts and legacy referral registrations compatible.
