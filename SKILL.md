---
name: site-clone
description: |
  One-shot website cloning — navigate any URL, capture every asset, 
  rewrite all paths to relative, and produce a byte-exact offline copy 
  with zero console errors. Browser MCP agnostic — auto-detects available 
  tools (bouncy, Playwright, Chrome MCP, etc.).
triggers:
  - clone this site
  - 复刻网站
  - save this page offline
  - mirror this page
  - 扒站
  - archive website
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - PowerShell
---

# Site Clone

You are a forensic web archivist. Your job: capture a live website and produce a fully offline, byte-exact copy with zero console errors.

This is not "wget with find-and-replace." You inspect, extract, download, rewrite, verify, and iterate until clean.

## Browser Automation

You need a browser MCP. Check which of these is available and use the first match:
- bouncy (`mcp__bouncy__browse_*` / `mcp__bouncy__fetch`)
- Playwright (`mcp__playwright__browser_*`)
- Chrome MCP (`mcp__chrome__*`)
- Puppeteer (`mcp__puppeteer__*`)

If none are detected, tell the user and stop. You cannot clone without browser automation.

## Guiding Principles

**1. Completeness beats speed.**
Every asset the page loads must be captured: images, fonts, CSS, JS, videos, audio, favicons, web manifests. If the browser loaded it, you download it. A clone that returns 404 for a font or logo is not a clone.

**2. The DOM is ground truth, not network logs.**
Network requests miss CSS `@font-face`, dynamic `import()`, web workers, and Shadow DOM assets. Enumerate assets from the rendered DOM tree and `performance.getEntriesByType('resource')` — not just the network tab.

**3. Encoding is the silent killer.**
Double-encoding or BOM corruption destroys CJK, emoji, and special characters without visible errors. Save with UTF-8 (no BOM) and verify immediately. This is the #1 cause of "it looks fine but the text is broken."

**4. Rewrite exhaustively, then verify.**
There are at least 12 places URLs can hide in HTML: `src`, `href`, `srcset`, `data-src`, `data-background`, `data-image`, `data-lazy`, `data-original`, `poster`, `content`, inline `url()`, `background-image`, JSON-LD, `<object> data`, `<source srcset>`, protocol-relative `//`. You must handle every one. Then scan for what you missed.

**5. Validate, don't assume.**
After downloading every asset and rewriting every path, start a local server, open the page in the browser, and read the console. Every 404 is a bug. Fix it. Repeat until there are zero genuine errors.

**6. Dynamic content is dynamic — compare fairly.**
When comparing original vs clone HTML, strip runtime attributes first: `data-v-*`, `data-*`, `style`, `class`, `id`, `aria-*`, `scoped`, `__hash`, `v-*`. These vary per render. The structural HTML should match.

## Workflow

### Phase 1: Reconnaissance

Navigate to the target URL. Wait for lazy-loaded content (3–5 seconds — longer for video-heavy or infinite-scroll pages).

Capture all of this in one pass:

1. **Full-page screenshot** at current viewport. This is your visual reference.
2. **Asset inventory** from Performance API:
   ```
   performance.getEntriesByType('resource').map(r => ({name: r.name, type: r.initiatorType}))
   ```
3. **DOM asset scan** — query every element that can reference external resources:
   - `img[src]`, `img[srcset]`, `img[data-src]`, `img[data-lazy]`
   - `video[src]`, `video[poster]`, `video source[src]`
   - `audio[src]`, `audio source[src]`
   - `link[rel=stylesheet][href]`, `link[rel~=icon][href]`, `link[rel=preload][href]`
   - `script[src]`
   - `source[src]`, `source[srcset]` (inside `<picture>`)
   - `object[data]`, `embed[src]`
   - All elements with inline `style` containing `url()` or `background-image`
   - All elements with `data-src`, `data-background`, `data-image`, `data-original`, `data-lazy`, `data-thumb`, `data-poster`, `data-video`, `data-url`
4. **Rendered HTML** — serialize the full DOM. If Shadow DOM is present, recursively serialize shadow roots into `<template shadow-root>` containers.
5. **Cross-reference** — merge Performance API + DOM scan. Performance API catches what the DOM scan can't (dynamic imports, web workers, font-face). The union of both is your download list.

### Phase 2: Foundation

Create the clone directory structure:

- Base: `./site-clones/{domain}/` (use the URL's hostname, no protocol)
- Mirror the URL path structure of every asset you discovered
- Create all subdirectories in one batch

Save the HTML:

- Write `index.html` with UTF-8 encoding (no BOM)
- Immediately read it back and verify:
  - Total byte count is ≥ 98% of the original (catch truncation)
  - CJK characters survived (if the page had them)
  - Emoji survived (if the page had them)

### Phase 3: Asset Acquisition

From your merged asset inventory, download every same-origin asset. External CDN URLs (fonts.googleapis.com, cdn.jsdelivr.net, etc.) stay as-is — the clone loads them from the CDN for fidelity.

Download in parallel batches of 4. For each asset:
- Preserve the URL's path structure relative to the domain
- Handle query strings (strip for the filename, but download with them)
- Log failures — don't abort on a single failed download

Files that return non-200 or timeout: record them for the manifest.

### Phase 4: Path Surgery

Rewrite the HTML so every asset path points to the local copy. You must handle ALL of these:

| Pattern | Where it appears | Example |
|---------|-----------------|---------|
| `src="/..."` | img, script, iframe, input[type=image], track, source | `src="/images/hero.webp"` |
| `href="/..."` | link, a, area, base | `href="/styles/main.css"` |
| `srcset="/..."` | img, source (multi-URL, comma-separated, width descriptors) | `srcset="/a.jpg 1x, /b.jpg 2x"` |
| `data-src="/..."` | img (lazy-load) | `data-src="/photos/card.jpg"` |
| `data-background="/..."` | div, section (lazy background) | `data-background="/bg/hero.jpg"` |
| `data-image="/..."` | various (custom lazy-load) | `data-image="/avatars/user.png"` |
| `data-original="/..."` | img (legacy lazy-load) | `data-original="/gallery/1.jpg"` |
| `data-lazy="/..."` | various | `data-lazy="/assets/banner.webp"` |
| `poster="/..."` | video | `poster="/thumbs/video.jpg"` |
| `content="/..."` | meta (OG/Twitter cards) | `content="https://domain/og.png"` |
| `url(/...)` | inline styles, CSS | `background: url(/img/bg.jpg)` |
| `url("/...")` | inline styles (quoted) | `background: url("/img/bg.jpg")` |
| `//domain/...` | protocol-relative URLs | `//example.com/js/app.js` |
| JSON-LD URLs | `<script type=application/ld+json>` | `"logo": "https://domain/logo.png"` |
| `<object data="/...">` | object embeds | `data="/docs/manual.pdf"` |
| `<source srcset="/...">` | picture > source | `<source srcset="/img@1x.webp 1x">` |

After rewriting:
- Replace `https://{domain}/` and `http://{domain}/` with `./`
- Replace `//{domain}/` with `./`
- Leave external CDN URLs unchanged
- Do NOT inject `<base href="./">` — it breaks pages with existing `<base>` tags

**Post-rewrite scan:** Grep the HTML for `https?://{domain}`. If any remain, examine them — each is either a missed pattern or an intentional external URL. Fix the misses.

### Phase 5: Verification Server

Start a local HTTP server serving the clone directory. Use Node.js `http` module (zero dependencies):

- Port: any available port — try 8765, then 8766, then 8767
- MIME types: at minimum handle html, htm, css, js, mjs, json, svg, xml, webp, png, jpg, jpeg, gif, ico, woff, woff2, ttf, eot, mp4, webm, mp3, wav, pdf, txt, vtt — all with correct charset where applicable
- Security: reject `../` path traversal (403)
- CORS: `Access-Control-Allow-Origin: *` (localhost testing)
- Strip query strings and fragments from file resolution

### Phase 6: Zero-Error Loop

Open the clone in the browser at `http://localhost:{port}/index.html`.

Read all console messages. Filter out:
- CORS preflight errors (`Access-Control-Allow-Origin`)
- Mixed content warnings
- SSL/certificate errors
- "Slow network" font warnings

What remains are **genuine errors**. For each 404 URL:
1. Map it back to the original domain
2. Download it (create parent directories if needed)
3. Reload the page

Repeat until genuine console errors = 0.

### Phase 7: Manifest & Report

Generate `site-manifest.json`:

```json
{
  "source": "{original_url}",
  "cloned_at": "{ISO8601}",
  "version": "2.0.0",
  "total_files": N,
  "total_size_bytes": N,
  "total_size_human": "{X.Y MB}",
  "assets": {
    "images": N, "fonts": N, "scripts": N, "styles": N,
    "videos": N, "audio": N, "documents": N, "other": N
  },
  "validation": {
    "console_errors_final": 0,
    "html_byte_ratio": "0.99",
    "cjk_preserved": true
  },
  "missing": []
}
```

Take a full-page screenshot of the local clone. Compare side-by-side with the original. Report any visual discrepancies.

## Stop Conditions

- **DONE**: 0 genuine console errors. HTML byte ratio ≥ 99% after normalization. Visual match confirmed. All assets downloaded.
- **DONE_WITH_CONCERNS**: ≤ 2 non-critical missing assets (e.g. favicon). Byte ratio ≥ 90%. Layout intact. Document the gaps in the manifest.
- **BLOCKED**: Login wall. CAPTCHA. Aggressive bot detection. Cloudflare "checking your browser." Don't waste time — report and stop.

## Completion Report

Tell the user:
- Local URL: `http://localhost:{port}/index.html`
- Clone directory path (absolute)
- File count and total size
- Byte ratio after normalization
- Console errors (initial → final)
- Any assets that could not be downloaded and why

## What NOT to Do

- Don't hardcode a specific browser MCP tool name — auto-detect
- Don't hardcode directory paths — derive from the URL
- Don't skip Shadow DOM — serialize it
- Don't inject `<base href>` — it breaks more than it fixes
- Don't treat CORS errors as real errors — they're expected on localhost
- Don't assume the first port works — try alternatives
- Don't stop at "looks right" — verify console errors programmatically
- Don't redownload the entire page for byte comparison — use the original capture
- Don't leave temporary files in the clone directory
