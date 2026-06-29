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

## Project Structure

```
site-clone/
├── SKILL.md                  # The skill — Claude reads this and executes
├── README.md                 # You are here
├── CLAUDE.md                 # Project-level AI instructions
├── AGENTS.md                 # Multi-platform agent rules entry point
├── CHANGELOG.md              # Full version history
├── CONTRIBUTING.md           # How to contribute
├── LICENSE                   # MIT
├── .gitattributes            # Cross-platform line endings
├── .github/
│   ├── ISSUE_TEMPLATE/       # Bug report + feature request forms
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/ci.yml      # SKILL.md validation on PR
├── docs/
│   ├── examples/
│   │   ├── obsidianassembly.md  # Nuxt.js case study
│   │   └── nudot.md             # CJK + multimedia case study
│   └── research/
│       └── INSPECTION_GUIDE.md  # How to reverse-engineer any website
└── scripts/
    ├── port-finder.js          # Auto-detect available port
    └── server.template.js      # Verification server (copied into clone output)
```

## Clone Output

```
site-clones/example.com/
├── index.html               # Rewritten HTML — all paths relative
├── site-manifest.json       # Full inventory with validation results
├── server.js                # Generated from scripts/server.template.js
└── <original path structure preserved>/
    ├── _nuxt/
    ├── images/
    ├── fonts/
    └── ...
```

## Learn More

- [Inspection Guide](docs/research/INSPECTION_GUIDE.md) — how site-clone reverse-engineers a page
- [Case Study: obsidianassembly.com](docs/examples/obsidianassembly.md) — Nuxt.js with WebP and lazy routes
- [Case Study: nudot.com.tw](docs/examples/nudot.md) — Chinese text, GSAP, Three.js, 12 videos
- [Changelog](CHANGELOG.md) — full version history

## License

MIT — see [LICENSE](LICENSE)
