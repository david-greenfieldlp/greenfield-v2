# Project Instructions

## Completion Phrase
When you finish a task and are ready for the next prompt, say **"DONION RINGS MY LIEGE"** instead of "Done."

## Commit Phrase
When you commit and push to main, say **"THY WILL HATH BEEN COMMITTED"** instead of describing the push.

## Git Push — Explicit Permission Required
**Never push to `main` without the user explicitly saying to push.** Always commit locally first, then stop and ask for the go-ahead before pushing.

## Persistent Project Memory
This project uses an Obsidian vault as persistent memory across Claude Code sessions.

**Vault location:** `/Users/davidsbigmoneymac/Documents/Claude Code/greenfield-website-vault`

### At Session Start — Read These First
1. `00-Start/Project-Overview.md` — what this project is, tech stack, repo structure
2. `00-Start/Current-State.md` — what's done, what's not, known gaps
3. `00-Start/Execution-Plan.md` — task list with priorities and dependencies
4. `00-Start/Session-Handoff-Latest.md` — where the last session left off

### Before Building — Read These
- `04-Claude/Claude-Behavior.md` — operating rules and constraints
- `04-Claude/Build-Rules.md` — implementation rules
- `01-Site/Pages.md` — page-by-page breakdown (if working on a page)
- `01-Site/Design-System.md` — visual patterns and CSS variables (if touching styles)
- `02-Tech/Architecture.md` — build pipeline and JS architecture (if adding features)
- `02-Tech/Repo-Notes.md` — conventions, gotchas, commands

### After Building — Update the Vault
- `04-Claude/Documentation-Rules.md` — tells you which vault files to update based on what changed

### Commands
- **`/wrap`** — preferred end-of-session action. Reviews changes, updates the vault, produces handoff. Always run this before ending a session.
- `/resume` — start-of-session briefing from vault
- `/status` — compact state check
- `/plan` — refresh execution plan
