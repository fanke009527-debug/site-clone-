# Case Study: nudot.com.tw

> **Status**: Verified working — CJK + multimedia stress test

## Site Profile

| Attribute | Value |
|-----------|-------|
| URL | https://nudot.com.tw |
| Language | Traditional Chinese (CJK) |
| Animation | GSAP + Three.js |
| Media | 12 videos, WebP images |
| Fonts | Self-hosted woff2 |

## Clone Results

| Metric | Value |
|--------|-------|
| Total files | 77 |
| Total size | 19.2 MB |
| Console errors (initial) | 8 |
| Console errors (after loop) | 0 |
| HTML byte ratio | 99%+ |
| CJK preservation | Byte-exact |

## Key Challenges

1. **CJK character encoding** — Traditional Chinese characters are 3 bytes in UTF-8. Double-encoding turns each character into 6+ bytes of mojibake. Solution: save as UTF-8 (no BOM) and immediately verify the byte count matches.

2. **Three.js textures** — Three.js loads textures dynamically via JavaScript, not HTML tags. Solution: Performance API captures these as `initiatorType: 'other'` resources.

3. **GSAP animation assets** — Some images preloaded by GSAP's asset loader. Solution: the wait time before capture is critical here; 5 seconds minimum.

4. **Self-hosted woff2 fonts** — Referenced via `@font-face` in CSS. DOM scan doesn't see these. Solution: Performance API with `initiatorType: 'css'`.

## Lessons Learned

- UTF-8 verification is the #1 quality gate for non-English sites — do it immediately after saving
- For Three.js / WebGL sites, `performance.getEntriesByType('resource')` is irreplaceable
- Video-heavy sites need longer initial wait (5+ seconds) for poster images and metadata to load
