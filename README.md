# site-clone — Forensic Website Cloning for Claude Code

> **Navigate. Capture. Download. Rewrite. Validate.** A single `/site-clone` command produces a fully offline, byte-exact mirror of any web page — with zero console errors.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-blue)](https://claude.ai/code)
[![Version](https://img.shields.io/badge/version-2.0.0-green)]()

```
  https://example.com
        │
        │  /site-clone
        │  • Reconnaissance — DOM + Performance API asset enumeration
        │  • Acquisition — parallel batch download, same-origin only
        │  • Path Surgery — 16+ attribute patterns rewritten to relative
        │  • Zero-Error Loop — iterate until console is clean
        │
        ▼
  site-clones/example.com/
  ├── index.html          ← byte-exact clone, all paths local
  ├── site-manifest.json  ← full inventory + validation report
  ├── server.js           ← zero-dependency Node.js static server
  └── assets/             ← original path structure preserved
```

---

## What It Does

site-clone transforms Claude Code into a forensic web archivist. It does not simply `wget` a page and run find-and-replace — it inspects the rendered DOM tree, cross-references against the Performance API, serializes Shadow DOM, downloads every same-origin asset, rewrites 16+ categories of URL patterns to relative paths, and iterates on console errors until none remain.

The result is a fully offline copy that loads identically to the original — same fonts, same images, same layout, zero broken references.

---

## Quick Start

### Prerequisites

- **Claude Code** (desktop, CLI, or IDE extension)
- **A browser MCP** — [bouncy](https://github.com/nicholasgriffintn/bouncy) (recommended), Playwright, Chrome DevTools, or Puppeteer — the skill auto-detects whichever is running
- **Node.js** — for the local verification server

### Installation

```bash
git clone https://github.com/fanke009527-debug/site-clone-.git ~/.claude/skills/site-clone
```

### Usage

In Claude Code:

```
/site-clone https://example.com
```

Or in natural language — all of these trigger the skill:

```
clone this site: https://example.com
复刻这个网站
save this page offline
扒站 https://example.com
mirror this page
archive website https://example.com
```

The skill runs a 7-phase pipeline and reports back:

```
Done. 77 files (19.2 MB), 0 console errors, byte ratio 99.4%.
Clone served at http://localhost:8765/index.html
```

---

## Pipeline

| # | Phase | Description |
|---|-------|-------------|
| 1 | **Reconnaissance** | Full DOM serialization (including Shadow DOM), Performance API resource enumeration, merged asset inventory |
| 2 | **Foundation** | Directory structure mirroring URL paths, UTF-8 save with CJK/emoji integrity verification |
| 3 | **Acquisition** | Parallel batch download (4 concurrent) of every same-origin asset; CDN URLs preserved for fidelity |
| 4 | **Path Surgery** | 16+ attribute patterns rewritten to relative paths, residual URL scan for missed references |
| 5 | **Verification Server** | Zero-dependency Node.js HTTP server with correct MIME types, CORS headers, and path traversal protection |
| 6 | **Zero-Error Loop** | Console error detection → noise filtering → download 404s → reload → iterate to zero genuine errors |
| 7 | **Manifest & Report** | `site-manifest.json` with full inventory, byte-ratio analysis, screenshot comparison |

---

## Design Philosophy

| Principle | Rationale |
|-----------|-----------|
| **Instruction-driven, not script-driven** | Claude is an AI engineer, not a shell executor. The skill describes *what* to achieve and *why*; Claude writes the code. |
| **Browser MCP agnostic** | Auto-detects bouncy, Playwright, Chrome MCP, or Puppeteer. No hardcoded tool names. Adapts to whatever is running. |
| **The DOM is ground truth** | Network logs miss `@font-face`, dynamic `import()`, Web Workers, and Shadow DOM assets. The rendered DOM tree + Performance API union catches everything. |
| **Exhaustive path rewriting** | URLs hide in 16+ places: `src`, `href`, `srcset`, `data-src`, `data-background`, `data-image`, `data-original`, `data-lazy`, `poster`, `content`, `url()`, JSON-LD, `<object>`, `<source>`, protocol-relative, and more. All must be handled. |
| **UTF-8 verification** | Double-encoding and BOM corruption are silent bugs that destroy CJK, emoji, and special characters. Verify immediately after save. |
| **Zero-error standard** | A clone with console errors is incomplete. Filter noise (CORS, mixed content, SSL), fix every genuine 404, iterate until clean. |
| **Cross-platform** | No hardcoded paths. Works identically on Windows, macOS, and Linux. |

---

## v2.0.0 — What Changed

The v2.0.0 rewrite represents a fundamental philosophy shift: from script-executor to forensic engineer. Key changes:

- **All hardcoded PowerShell scripts removed** — the skill describes strategy, Claude implements it
- **Browser MCP auto-detection** — works with bouncy, Playwright, Chrome MCP, or Puppeteer
- **Port auto-detection** — tries 8765 → 8766 → 8767, no port conflicts
- **16 documented attribute patterns** — exhaustive URL rewriting strategy with examples
- **Quoted CSS `url()` handling** — both `url("/path")` and `url('/path')` covered
- **Byte comparison from original capture** — no re-fetch, fair comparison after stripping runtime attributes
- **6 Guiding Principles, 7 Phases, Stop Conditions, "What NOT to Do"**

See [CHANGELOG.md](CHANGELOG.md) for the full version history.

---

## Verified Test Cases

| Site | Characteristics | Files | Size | Console Errors | Fidelity |
|------|----------------|-------|------|----------------|----------|
| **obsidianassembly.com/places** | Nuxt.js, WebP images, lazy-loaded routes, dynamic imports | 49 | — | 0 | 99% |
| **nudot.com.tw** | Chinese text, GSAP scroll animations, Three.js 3D rendering, 12 background videos, Cloudflare | 77 | 19.2 MB | 0 | Byte-exact |

---

## Repository Structure

```
site-clone/
├── SKILL.md                   # The skill — Claude reads this and executes
├── README.md                  # You are here
├── CLAUDE.md                  # Project-level AI instructions
├── AGENTS.md                  # Multi-platform agent rules
├── CHANGELOG.md               # Full version history (v1.0.0 → v2.0.0)
├── CONTRIBUTING.md            # How to contribute
├── LICENSE                    # MIT
├── .gitattributes             # Cross-platform line ending normalization
├── .github/
│   ├── ISSUE_TEMPLATE/        # Bug report + feature request forms
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       └── ci.yml             # SKILL.md frontmatter validation on PR
├── docs/
│   ├── examples/
│   │   ├── nudot.md           # CJK + multimedia case study
│   │   └── obsidianassembly.md # Nuxt.js case study
│   └── research/
│       └── INSPECTION_GUIDE.md # Reverse-engineering methodology
└── scripts/
    ├── port-finder.js         # Auto-detect available port
    └── server.template.js     # Verification server (copied into clone output)
```

### Clone Output

After running `/site-clone`, the target site is reproduced at `site-clones/{domain}/`:

```
site-clones/example.com/
├── index.html                 # Rewritten HTML — all paths relative
├── site-manifest.json         # Full inventory with validation results
├── server.js                  # Generated from scripts/server.template.js
└── {original path structure preserved}/
    ├── _nuxt/                 # Framework assets
    ├── images/
    ├── fonts/
    └── ...
```

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

- Commit style: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- Primary test site: `obsidianassembly.com/places` (Nuxt.js, WebP, lazy routes)
- Secondary test site: `nudot.com.tw` (CJK text, GSAP, Three.js, video-heavy)
- Keep `SKILL.md` under 250 lines — instruction density matters

---

## Learn More

- [Inspection Guide](docs/research/INSPECTION_GUIDE.md) — how site-clone reverse-engineers a page
- [Case Study: obsidianassembly.com](docs/examples/obsidianassembly.md) — Nuxt.js with WebP and lazy routes
- [Case Study: nudot.com.tw](docs/examples/nudot.md) — Chinese text, GSAP, Three.js, 12 videos

---

## License

MIT — see [LICENSE](LICENSE)
