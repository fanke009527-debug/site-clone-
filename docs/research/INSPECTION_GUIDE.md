# Website Inspection Guide

## What to Capture During Reconnaissance

When site-clone navigates to a target URL, it must extract everything needed for a complete offline copy.

## Phase 1: Asset Discovery

### DOM Scan Targets

| Element | Attributes | Notes |
|---------|-----------|-------|
| `<img>` | src, srcset, data-src, data-lazy, data-original | Lazy images commonly use data- attributes |
| `<video>` | src, poster, data-poster | Also check `<source>` children |
| `<audio>` | src | Also check `<source>` children |
| `<link>` | href (stylesheet, icon, preload) | rel=preload often reveals critical assets |
| `<script>` | src | Includes async/defer scripts |
| `<source>` | src, srcset | Inside `<picture>` and `<video>` |
| `<object>` | data | PDFs, SVGs, embeds |
| `<embed>` | src | Legacy embeds |
| `style` attribute | url() | Inline background images on any element |

### Hidden Asset Sources

- **CSS `@font-face`** — not visible in DOM. Use Performance API.
- **Dynamic `import()`** — code-split chunks. Use Performance API.
- **Web Workers** — `new Worker('...')`. Use Performance API.
- **Shadow DOM** — encapsulated trees. Serialize recursively.
- **JSON-LD** — `<script type="application/ld+json">`. May contain image URLs for OG/schema.

### Performance API

```js
performance.getEntriesByType('resource').map(r => ({
  name: r.name,
  type: r.initiatorType
}))
```

This catches what DOM scan misses: fonts, dynamic imports, workers, XHR prefetches.

## Phase 2: URL Classification

For each discovered URL, classify it:

| Classification | Action |
|---------------|--------|
| Same-origin | Download locally, rewrite to relative path |
| CDN (common) | Leave as-is (cdn.jsdelivr.net, fonts.googleapis.com, etc.) |
| CDN (unknown) | Download if possible, otherwise leave |
| Third-party tracking | Skip (analytics, pixels) |

## Phase 3: Path Pattern Recognition

Map URL paths to directory structure. Common patterns:

```
/_nuxt/*        → Nuxt.js static assets
/static/*       → Generic static files
/assets/*       → Bundled assets
/images/*       → Image directory
/fonts/*        → Font files
/videos/*       → Video files
/_next/static/* → Next.js assets
/dist/*         → Built output
/public/*       → Public assets
```

## Phase 4: Common Failure Modes

| Failure | Symptom | Fix |
|---------|---------|-----|
| Double encoding | CJK characters become garbled | Save UTF-8 no BOM, verify immediately |
| Truncated save | HTML ends abruptly | Check byte count vs original |
| Missing lazy assets | Below-fold images 404 | Increase wait time before capture |
| CSS url() missed | Background images 404 | Grep for `url\(` in saved HTML |
| Protocol-relative URLs | `//cdn.example.com/` not rewritten | Handle `//` prefix |
| Quoted CSS urls | `url("/path")` not matched | Match both `url(/...)` and `url("/...")` and `url('/...')` |
