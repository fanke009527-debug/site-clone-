# Case Study: obsidianassembly.com/places

> **Status**: Verified working — primary test target for site-clone

## Site Profile

| Attribute | Value |
|-----------|-------|
| URL | https://obsidianassembly.com/places |
| Framework | Nuxt.js (SPA with static generation) |
| Image format | WebP with lazy loading |
| Routing | Lazy-loaded route chunks |
| Content | English, video backgrounds |

## Clone Results

| Metric | Value |
|--------|-------|
| Total files | 49 |
| Console errors (initial) | 12 |
| Console errors (after loop) | 0 |
| HTML byte ratio | 99% |
| Visual match | Near pixel-perfect |

## Key Challenges

1. **Nuxt.js lazy routes** — route chunks loaded dynamically via `import()`. Solution: Performance API caught these; DOM scan would miss them.

2. **WebP images with data-src** — images use `data-src` for lazy loading, not `src`. Solution: query both `img[src]` and `img[data-src]`.

3. **CSS background images** — section backgrounds via inline `style="background-image: url(...)"`. Solution: scan all elements with inline styles.

4. **Source maps** — Nuxt generates `.map` files referenced via `//# sourceMappingURL=`. These are optional and not downloaded (would add unnecessary size).

## Lessons Learned

- Always wait 3-5 seconds before capture — lazy content takes time
- Performance API + DOM scan catches ~95% of assets; the validation loop catches the rest
- Don't inject `<base href>` — Nuxt's router handles relative paths natively
