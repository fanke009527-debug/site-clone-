# site-clone — Claude Code Website Cloning Skill

> Navigate → capture → download → rewrite → validate → done.
> Produces a fully offline, byte-exact copy of any web page with **zero console errors**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-blue)](https://claude.ai/code)
[![Version](https://img.shields.io/badge/version-2.0.0-green)]()

## What it does

Point it at a URL. Claude becomes a forensic web archivist — inspecting every asset, downloading everything, rewriting all paths to local, and iterating until the console is clean.

| Phase | Action |
|-------|--------|
| 1. Reconnaissance | Navigate, enumerate all assets from DOM + Performance API, capture Shadow DOM, serialize HTML |
| 2. Foundation | Directory structure, UTF-8 save with CJK/emoji integrity verification |
| 3. Acquisition | Parallel batch download of every same-origin asset |
| 4. Path Surgery | 16+ attribute patterns rewritten to relative, residual URL scan |
| 5. Verification Server | Zero-dependency Node.js server, CORS headers, directory traversal protection |
| 6. Zero-Error Loop | Console error detection → filter noise → download 404s → iterate to zero genuine errors |
| 7. Manifest & Report | site-manifest.json, screenshot comparison, completion report |

## Installation

```bash
git clone https://github.com/fanke009527-debug/site-clone-.git ~/.claude/skills/site-clone
```

Requires:
- **Claude Code** CLI
- **A browser MCP** — bouncy, Playwright, Chrome MCP, or Puppeteer (auto-detected)
- **Node.js** — for the local verification server

## Usage

```
/site-clone https://example.com
```

Or natural language:

```
clone this site: https://example.com
复刻这个网站
save this page offline
扒站 https://example.com
mirror this page
archive website https://example.com
```

## Browser MCP

The skill auto-detects the first available browser MCP from:
- **bouncy** — recommended, 100× faster than Playwright
- **Playwright MCP** (`npx @playwright/mcp`)
- **Chrome MCP**
- **Puppeteer MCP**

No configuration needed — it adapts to whatever is running.

## Design Philosophy

| Principle | Why |
|-----------|-----|
| **Instruction-driven, not script-driven** | Claude is an AI, not a shell executor. Tell it what to achieve, it writes the code. |
| **Browser MCP agnostic** | Auto-detect available tools. No hardcoded tool names. |
| **The DOM is ground truth** | Network logs miss dynamic imports, font-face, and workers. DOM + Performance API catch everything. |
| **Exhaustive path rewriting** | 16+ patterns covering every place a URL can hide in HTML. |
| **UTF-8 verification** | Double-encoding is the #1 silent bug. Verify immediately after save. |
| **Zero-error standard** | Iterate on console errors until there are zero genuine ones. CORS noise doesn't count. |
| **Cross-platform** | No hardcoded paths. Works on Windows, macOS, and Linux. |

## Test Cases

| Site | Type | Files | Size | Console Errors | Match |
|------|------|-------|------|----------------|-------|
| obsidianassembly.com/places | Nuxt.js, WebP, lazy routes | 49 | — | 0 | 99% |
| nudot.com.tw | Chinese, GSAP, Three.js, 12 videos | 77 | 19.2 MB | 0 | Byte-exact |

## Output Structure

```
site-clones/example.com/
├── index.html               # Rewritten HTML — all paths relative
├── site-manifest.json       # Full inventory with validation results
├── server.js                # Zero-dependency verification server
└── <original path structure preserved>/
    ├── _nuxt/
    ├── images/
    ├── fonts/
    └── ...
```

## Changelog

### v2.0.0 — Complete Rewrite

**Philosophy shift:** Claude is now a forensic engineer, not a script executor.

- Removed all hardcoded PowerShell scripts — instruction-driven workflow
- Browser MCP auto-detection (bouncy / Playwright / Chrome / Puppeteer)
- Cross-platform: no hardcoded `E:\` paths, output to `./site-clones/`
- 16 attribute patterns documented as strategy, not as copy-paste code
- Quoted CSS `url()` handling: `url("/path")` and `url('/path')` now covered
- `www.` subdomain and protocol-relative URL download support
- Port auto-detection for verification server (8765 → 8766 → 8767)
- Byte comparison now uses the original saved capture (no re-fetch)
- "What NOT to Do" section from real failure cases

### v1.0.2
- Generic path rewrite patterns (replaced hardcoded `/_nuxt/`, `/images/`, `/fonts/`)
- Performance API + Shadow DOM + UTF-8 verification
- 25 MIME types with charset, directory traversal protection
- CORS/SSL noise filtering in validation loop

### v1.0.1
- Initial release — 8-step pipeline with Playwright

## License

MIT
