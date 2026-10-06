# social-week

An agent skill that ends with a result, not a setup: from a short brief the agent researches angles with its own
tools, writes a 7-day content calendar with a different native draft per network (plus image and video prompts where a
network needs media), gets the user's approval of the exact text and times, schedules the week in PostWire, and hands
back the queue and a what-to-measure checklist. The next week it reads what worked (`get_post_performance`) and adapts.

Page: https://postwire.io/skills/social-week/ · Skill: https://postwire.io/skills/social-week/SKILL.md · License: MIT-0

## Files

| File | What it is |
|---|---|
| `SKILL.md` | The skill. The only source: everything below is built from it. |
| `scripts/schedule-week.mjs` | Optional, zero-dependency Node 18+ helper: approved calendar JSON → bulk rows → dry run → (`--confirm`) schedule; `--report` reads what worked. |
| `agents/AGENTS.md` | Section to paste into an `AGENTS.md` for agents without skill support. |
| `agents/social-week.mdc` | Cursor rule for projects that only use `.cursor/rules/`. |
| `build.mjs` | Writes `public/skills/social-week/SKILL.md` (served, byte for byte), `public/skills/social-week/social-week.zip` (Claude app upload) and `dist/clawhub/social-week/` (ClawHub folder: same SKILL.md plus `metadata.openclaw`). `--check` fails when any is stale. |

After editing `SKILL.md`: `node skills/social-week/build.mjs && node scripts/landing/build.mjs`, bump `metadata.version`.

## Install (users)

| Agent | Command |
|---|---|
| Any (skills CLI, 40+ agents) | `npx skills add https://postwire.io --skill social-week -g` (reads `/.well-known/agent-skills/index.json`) |
| Claude Code | `mkdir -p ~/.claude/skills/social-week && curl -fsSL https://postwire.io/skills/social-week/SKILL.md -o ~/.claude/skills/social-week/SKILL.md` |
| Claude app | Customize → Skills → upload https://postwire.io/skills/social-week/social-week.zip |
| Codex | same `curl` into `~/.agents/skills/social-week/` |
| Cursor | same `curl` into `~/.cursor/skills/social-week/` |
| OpenClaw | same `curl` into `~/.openclaw/skills/social-week/`, or `openclaw skills install social-week` once on ClawHub |
| No install | tell the agent: `Use https://postwire.io/skills/social-week/SKILL.md (read it raw) to plan and schedule my posts for next week.` |

## Publish (owner; each needs Renzo's account, none was done)

1. **Deploy postwire.io** (the page, the served SKILL.md, the zip and the well-known index go live with it). Check:
   `curl -s https://postwire.io/.well-known/agent-skills/index.json` lists `postwire` and `social-week`, then
   `npx skills add https://postwire.io --list`.
2. **House partner code** (so installs → sign-ups are measured; the skill already links `https://postwire.io/p/skill?to=/dashboard.html`,
   which lands on the dashboard without tracking until the code exists):
   ```bash
   node scripts/partners.mjs add --code skill --name "Skill: social-week (house)" --email skill@postwire.io \
     --pct 1 --no-tier --cookie-days 90 --payout "house: never pay" --notes "house code: measures social-week installs -> signups"
   node scripts/partners.mjs list        # clicks, signups, activated, paying for "skill"
   ```
   1 % with no tier is the lowest the CLI takes; the payout report will show cents for it: never mark them paid.
   Our own `postwire.io` addresses are never attributed to it (self-referral rule).
3. **ClawHub** (GitHub login; the account must be the publisher):
   ```bash
   npm i -g clawhub && clawhub login && clawhub whoami
   clawhub skill publish skills/social-week/dist/clawhub/social-week --slug social-week --name "Social Week" \
     --categories communication,automation,creative --topics "social-media,content-calendar,scheduling,marketing,postwire" \
     --changelog "First release: brief, research, 7-day calendar, approval, scheduling with PostWire, measurement, weekly re-run" --dry-run
   # then the same without --dry-run
   ```
   The slug `social-week` was free on 6-oct (`GET https://clawhub.ai/api/v1/skills/social-week` → 404). Everything on
   ClawHub is MIT-0; the skill says so. New releases wait for ClawHub's security checks before they are installable.
4. **skills.sh leaderboard**: the CLI's telemetry only lists skills from public GitHub repos. Create one with the
   skill folder (`SKILL.md`, `scripts/`, this README): e.g. `gh repo create Perufitlife/postwire-skills --public`,
   copy `skills/social-week/` into its `skills/social-week/`, push. Then `npx skills add Perufitlife/postwire-skills --skill social-week`
   counts as an install on skills.sh. The same repo can be added to ClawHub's GitHub importer.
5. **After ClawHub**: add `openclaw skills install social-week` to the OpenClaw tab of `scripts/landing/pages/skills-social-week.html`.

## Measure

- Installs: ClawHub `GET https://clawhub.ai/api/v1/skills/social-week` (downloads), skills.sh page of the repo,
  `sw_*` and `pw_copy_install_sw_*` steps in `pw_funnel` (copies and zip downloads on the page).
- Sign-ups: `node scripts/partners.mjs list` → the `skill` row.
- Use by existing accounts: scheduled posts whose label starts with `social-week · ` (the skill labels every row), and
  `api_source` rows with `source=mcp-skill-social-week` (REST calls from the skill).

## Tests

```bash
node test/skill-social-week-unit.mjs     # frontmatter per target, zip, well-known digest as served, ClawHub metadata, facts vs code, partner link, page
node test/skill-social-week-dryrun.mjs   # the scheduling and re-run logic against a mocked PostWire API (no real posts)
```
