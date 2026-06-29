@CLAUDE.md

# Agent Instructions — site-clone

This is a Claude Code skill project. When contributing:

- `SKILL.md` is the single source of truth for the cloning workflow
- Keep SKILL.md under 250 lines — every line must earn its place
- Browser MCP auto-detection: never hardcode a specific tool name
- Cross-platform: no hardcoded `E:\` or `/home/` paths
- Test changes against at least one real website before committing

## File responsibilities

| File | Purpose |
|------|---------|
| SKILL.md | Claude's execution instructions |
| README.md | Human-readable project page |
| docs/ | Case studies and reference material |
| scripts/ | Helper utilities (not part of the skill itself) |
| .github/ | Community and CI infrastructure |

## Commit conventions

- `feat:` — new capability in SKILL.md
- `fix:` — bug fix in SKILL.md or scripts
- `docs:` — README, examples, comments
- `chore:` — CI, templates, meta
