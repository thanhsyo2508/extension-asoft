# Changelog

## v2.16 — 2026-06-16
- Fix: ApplicationID generation now respects the zero-padding length returned in `LastKey` from the ERP API to avoid malformed or duplicate IDs when creating vouchers (DX* / DQT/* prefixes).
- Fix: Improved batch submission logging and UI error reporting — full server response is logged and error messages are collected and displayed when batch submissions fail.
- Improvement: Retry logic when `ApplicationID` conflicts now re-requests a new key and preserves the server's padding format.

Files changed in this release:
- `attendance-extension/content.js` (payload creation, logging, retry behavior)
- `attendance-extension/manifest.json` (version bump 2.15 → 2.16)
- `README.md`, `README_FEATURE.md`, `AGENTS.md` (version and changelog updates)

---

Please rebuild or re-package the extension (update zip/release) if you publish this release.
