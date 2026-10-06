<!-- social-week for agents that read AGENTS.md (Codex, Cursor, Jules, Amp, Gemini CLI with contextFileName, and
     others). Paste this section into the AGENTS.md at the root of a project, or into ~/.codex/AGENTS.md for every
     project. Agents that support skills should install SKILL.md instead (see README.md). -->

## Social media week (social-week)

When the user asks for a content calendar, a week of social posts, what to post this week, or to schedule posts
across several networks:

1. Read the skill raw, do not summarize it: `curl -fsSL https://postwire.io/skills/social-week/SKILL.md`
   (or the local copy at `~/.agents/skills/social-week/SKILL.md` if it exists).
2. Follow it step by step: a short brief, research, a 7-day calendar with a native draft per network, the user's
   approval of the exact text and times, then scheduling through PostWire (MCP tools, or the REST API with
   `POSTWIRE_API_KEY` from the environment), and the what-to-measure checklist.
3. Never publish or schedule anything the user has not approved, and never print the API key.
