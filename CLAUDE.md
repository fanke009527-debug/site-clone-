---
name: site-clone
description: Instructions for developing and improving the site-clone skill
---

# site-clone — Project Guide

This project is a Claude Code skill for one-shot website cloning. Navigate any URL, capture every asset, rewrite all paths to relative, produce a byte-exact offline copy with zero console errors.

## Architecture

```
SKILL.md          # The skill — Claude reads this and executes
README.md         # Human-facing documentation and install guide
docs/             # Examples, research guides
scripts/          # Helper scripts (port finding, server template)
.github/          # Issue/PR templates, CI
```

## How SKILL.md Works

SKILL.md is an **instruction document**, not a script. It tells Claude WHAT to achieve (goals, constraints, stop conditions), and Claude writes the code to get there. This is intentional — hardcoded scripts rot; principles don't.

Key design decisions:
- **Browser MCP agnostic** — auto-detect bouncy/Playwright/Chrome/Puppeteer
- **DOM is ground truth** — Performance API + DOM scan, not network logs
- **Zero-error standard** — iterate on console errors until 0 genuine ones
- **No `<base href>` injection** — breaks existing `<base>` tags
- **Output to `./site-clones/`** — cross-platform, relative to cwd

## Testing

Primary test target: `https://obsidianassembly.com/places` (Nuxt.js, WebP, lazy routes)

Acceptance criteria:
- 0 genuine console errors (CORS noise filtered)
- HTML byte ratio >= 99% after normalization
- Visual comparison: layout intact
- All same-origin assets downloaded

## Modifying SKILL.md

1. Keep under 250 lines — instruction density matters
2. Don't hardcode tool names — use auto-detection patterns
3. Every phase must have a clear stop condition
4. Add to "What NOT to Do" when you encounter a real mistake
5. Test with at least 2 different sites before shipping

## Scripts

- `scripts/port-finder.js` — finds the next available port starting from 8765
- `scripts/server.template.js` — zero-dependency Node.js verification server, copied into clone output at verification time
