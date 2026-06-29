# site-clone — Claude Code Website Cloning Skill

> One-shot website cloning skill for Claude Code. Navigate → capture → download → rewrite → validate → done.
> Produces a fully offline, byte-exact copy of any web page with **zero console errors**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-blue)](https://claude.ai/code)
[![Version](https://img.shields.io/badge/version-1.0.2-green)]()

## What it does

| Step | Action | v1.0.2 |
|------|--------|--------|
| 1. Capture | Navigate + Performance API resource list + network requests + Shadow DOM serialization | Enhanced |
| 2. Setup | Create clone directory tree from extracted URL paths | |
| 3. Save HTML | Verified UTF-8 encoding (no BOM) with CJK/emoji integrity check | Enhanced |
| 4. Download | Merged Performance API + network log deduplication; download every asset | Enhanced |
| 5. Rewrite | **12+ attribute patterns** — generic (not hardcoded) path replacement | **Rewritten** |
| 6. Compare | Byte-level HTML comparison (runtime attributes stripped for fair comparison) | Enhanced |
| 7. Server | Zero-dependency Node.js server — 25 MIME types with charset, CORS headers, dir traversal protection | **Fixed** |
| 8. Validate | Console error detection → filter CORS/SSL noise → download 404s → iterate to zero genuine errors | Enhanced |
| 9. Manifest | Generate `site-manifest.json` with validation results | Enhanced |
| 10. Screenshot | Full-page visual comparison | |

## Installation

```bash
git clone https://github.com/fanke009527-debug/site-clone-v1.0.2.git ~/.claude/skills/site-clone
```

Requires:
- **Claude Code** CLI
- **Playwright MCP** (`npx @playwright/mcp`) — primary capture engine
- **Node.js** — for the local verification server

## Usage

In Claude Code:

```
/site-clone https://example.com/landing-page
```

Or natural language:

```
clone this site: https://example.com
复刻这个网站
save this page offline
扒站 https://example.com
mirror this page
```

## Changelog

### v1.0.2

**Bugs fixed:**
- Path rewriting was hardcoded to `/_nuxt/`, `/images/`, `/fonts/` — now uses generic patterns that match any directory structure
- Server startup used Unix-only `node server.js &` — now cross-platform (Windows + Linux/Mac)
- Server MIME types missing `charset=utf-8` — added full charset table for all text types (25 MIME types total)
- Removed dangerous `<base href="./">` injection (broke pages with existing `<base>` tags)
- Added directory traversal protection to the server
- Server now handles fragment identifiers (`#`) in URLs

**Added (previously in README but missing from SKILL.md):**
- Performance API resource list as ground truth (catches CSS `@font-face`, dynamic `import()`, web workers)
- Shadow DOM serialization for Web Components
- UTF-8 encoding verification with CJK/emoji integrity check
- Byte-level HTML comparison with runtime-attribute stripping
- `srcset` attribute rewriting (comma-separated URLs with width descriptors)
- Lazy-load attribute rewriting: `data-src`, `data-background`, `data-image`, `data-defer-src`, `data-lazy`, `data-original`, `data-thumb`, `data-poster`, `data-video`, `data-url`
- `<video>/<audio>` `<source>` and `<track>` rewriting
- Inline CSS `url()` rewriting
- `<meta>` Open Graph / Twitter Card URL rewriting
- JSON-LD `schema.org` URL rewriting
- `<picture>` `<source srcset>` rewriting
- Inline `background-image: url()` rewriting
- Post-rewrite verification scan for remaining absolute URLs
- CORS/SSL error filtering in validation loop
- Cross-reference step: Performance API vs network requests

### v1.0.1
- Initial public release
- 8-step pipeline: Capture → Setup → Download → Rewrite → Server → Validate → Manifest → Screenshot
- Two capture modes: Full (Playwright) vs Static (curl)

## Key design decisions

| Decision | Why |
|----------|-----|
| **Performance API as ground truth** | `performance.getEntriesByType('resource')` catches CSS @font-face, dynamic imports, workers — everything the browser loaded |
| Shadow DOM serialization | Web Components and shadow roots are recursively serialized into the HTML |
| Exhaustive attribute grep (12+ patterns) | Covers `data-src`, `data-image`, `data-defer-src`, `srcset`, `poster`, `track`, `embed`, `object`, inline styles |
| UTF-8 encoding verification | Double-encoding was the #1 silent bug; CJK/emoji would corrupt without warning |
| Byte-level HTML comparison | One command catches encoding corruption, truncation, AND missing dynamic content |
| Generic regex (not hardcoded dirs) | Hardcoded `/_nuxt/` etc. failed for sites using `/assets/`, `/static/`, `/dist/` |
| CORS error filtering | Localhost always triggers CORS — these are NOT real errors and must be ignored |
| Directory traversal protection | Prevent `../../../etc/passwd` path injection on the local server |

## Test cases

| Site | Type | Files | Size | Console Errors | HTML Match |
|------|------|-------|------|----------------|------------|
| obsidianassembly.com/places | Nuxt.js, WebP, lazy routes | 49 | — | 0 | 99% |
| nudot.com.tw | Chinese, GSAP, Three.js, 12 videos | 77 | 19.2 MB | 0 | Byte-exact |

## File structure

```
site-clone/
├── SKILL.md              # The skill definition (Claude Code loads this)
├── README.md             # This file
├── LICENSE               # MIT
└── .gitignore
```

After running, the clone output looks like:

```
site-clones/example.com/
├── index.html            # Rewritten HTML — byte-exact match after normalization
├── server.js             # Zero-dependency verification server
├── site-manifest.json    # Full inventory with validation results
├── _nuxt/                # Original path structure preserved
├── images/
├── fonts/
└── ...
```

## Compatibility

| AI Tool | Mode | Quality |
|---------|------|---------|
| **Claude Code** | Full (Playwright + Performance API) | Byte-exact match |
| **Codex CLI** | Static (curl + regex) | Functional, no JS rendering |
| **Cursor** | Static (curl + regex) | Functional, no JS rendering |
| **aider / terminal AI** | Static (curl + regex) | Functional, no JS rendering |

For non-Claude-Code tools, assets loaded via JS (dynamic imports, Shadow DOM, CSS fonts, Web Workers) will be missing.

## Prior art

- HTTrack — the classic website copier, but CLI-native and Claude Code-integrated
- gstack browse `archive` command — MHTML single-page snapshots
- Playwright's network interception API — the core capture mechanism

## License

MIT
