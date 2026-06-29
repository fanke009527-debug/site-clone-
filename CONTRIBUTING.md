# Contributing to site-clone

## Getting Started

1. Fork the repo
2. Clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/site-clone-.git ~/.claude/skills/site-clone
```

3. Create a feature branch:

```bash
git checkout -b feat/your-feature
```

## Development

The skill lives entirely in `SKILL.md`. To test changes:

1. Edit `SKILL.md`
2. Run `/site-clone https://obsidianassembly.com/places` (primary test site)
3. Verify: 0 console errors, byte ratio >= 99%, visual match

## Commit Style

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `refactor:` — restructure without functional change
- `chore:` — CI, scripts, meta

## Testing Sites

| Site | What it tests |
|------|--------------|
| obsidianassembly.com/places | Nuxt.js, WebP, lazy routes |
| nudot.com.tw | Chinese text, GSAP, Three.js, videos |

## Pull Requests

- Target `master` branch
- Include screenshots of the clone result if you changed cloning logic
- Keep `SKILL.md` under 250 lines — instruction density matters

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
