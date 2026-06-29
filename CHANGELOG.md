# Changelog

## v2.0.0 — Complete Rewrite (2026-06-30)

**Philosophy shift:** Claude is now a forensic engineer, not a script executor.

- Removed all hardcoded PowerShell scripts — instruction-driven workflow
- Browser MCP auto-detection (bouncy / Playwright / Chrome / Puppeteer)
- Cross-platform: no hardcoded paths, output to `./site-clones/`
- 16 attribute patterns documented as strategy, not as copy-paste code
- Quoted CSS `url()` handling: `url("/path")` and `url('/path')` covered
- `www.` subdomain and protocol-relative URL download support
- Port auto-detection for verification server (8765 -> 8766 -> 8767)
- Byte comparison uses the original saved capture (no re-fetch)
- 6 Guiding Principles, 7 Phases, Stop Conditions, "What NOT to Do"

## v1.0.2 — Bug Fix & Enhancement (2026-06-29)

- Generic path rewrite patterns (replaced hardcoded `/_nuxt/`, `/images/`)
- Performance API asset discovery as ground truth
- Shadow DOM serialization with `<template shadow-root>`
- UTF-8 encoding verification with CJK/emoji integrity
- 25 MIME types with charset, directory traversal protection (403)
- CORS/SSL noise filtering in validation loop
- `$baseUrl` regex fix (produced double-protocol `https://https://`)
- Quote-safe `url()` rewrite patterns for inline CSS

## v1.0.1 — Initial Release (2026-06-28)

- 8-step pipeline with Playwright MCP
- PowerShell-based asset download and path rewriting
- Node.js zero-dependency local verification server
- Console error validation loop

## v1.0.0 — Pre-release

- Initial concept and testing
