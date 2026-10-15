# PostWire skills for AI agents

Skills that let an AI agent (Claude Code, Codex, Cursor, OpenClaw and 40+ agents that read Agent Skills) plan, write and publish social media posts through [PostWire](https://postwire.io).

| Skill | What it does |
|---|---|
| [`social-week`](skills/social-week/) | Plans, writes and **schedules** a full week of native posts for up to 9 networks from one brief — you approve, it queues them, you get the live queue. |
| [`crosspost`](skills/crosspost/) | Cross-posts one short video or idea to TikTok, Instagram Reels, YouTube Shorts, Facebook, LinkedIn, Bluesky and more, a native caption per network, and returns every live link. |
| [`tiktok-upload`](skills/tiktok-upload/) | Uploads and publishes (or schedules) a video or photo carousel to TikTok through the official Content Posting API: no developer app, no cookies. |
| [`instagram-post`](skills/instagram-post/) | Publishes or schedules an Instagram photo, carousel (up to 10) or Reel through the official API, business or creator accounts. |
| [`youtube-upload`](skills/youtube-upload/) | Uploads a video or Short to YouTube (now or scheduled) with a searchable title, public/unlisted/private: no Google Cloud project or OAuth client. ClawHub: `upload-to-youtube`. |
| [`linkedin-post`](skills/linkedin-post/) | Writes and publishes a first-person LinkedIn post on your profile, link in the first comment, up to 20 images or a PDF carousel. ClawHub: `post-to-linkedin`. |
| [`schedule-posts`](skills/schedule-posts/) | Schedules posts on any network: one at a set time, the next free queue slot, a CSV batch with a dry run, or a recurring post; then lists and cancels. |
| [`postwire`](skills/postwire/) | Connects the agent to PostWire and publishes your first post. |

Claude Code plugin (all the skills plus the PostWire MCP server, sign in once with OAuth):

```text
/plugin install postwire --marketplace Perufitlife/postwire-skills
```

On older Claude Code: `/plugin marketplace add Perufitlife/postwire-skills`, then `/plugin install postwire@postwire`.

Install:

```bash
npx skills add https://postwire.io --skill social-week
```

Any skill from this repo:

```bash
npx skills add Perufitlife/postwire-skills --skill crosspost
clawhub install crosspost        # OpenClaw
```

Or tell your agent: `set up https://postwire.io/SKILL.md`.

More: https://postwire.io/skills/social-week/

## What this plugin runs and sends

- **MCP server:** one remote server, `https://postwire.io/api/mcp` (Streamable HTTP). You sign in to PostWire with OAuth in your browser the first time a tool is used; no key is stored in the plugin.
- **Data sent:** only what you ask the agent to publish or schedule (post text, media links, times, chosen networks) goes to postwire.io, which publishes it to the social accounts you connected there. Nothing else on your machine is read or sent.
- **No hooks, no scripts, no local servers.** The skills are Markdown instructions. Their optional REST examples use a PostWire API key only if you create one in the dashboard and set it yourself.
- Privacy policy: https://postwire.io/privacy.html · Terms: https://postwire.io/terms.html · Support: support@postwire.io
