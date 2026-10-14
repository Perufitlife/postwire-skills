# PostWire skills for AI agents

Skills that let an AI agent (Claude Code, Codex, Cursor, OpenClaw and 40+ agents that read Agent Skills) plan, write and publish social media posts through [PostWire](https://postwire.io).

| Skill | What it does |
|---|---|
| [`social-week`](skills/social-week/) | Plans, writes and **schedules** a full week of native posts for up to 9 networks from one brief — you approve, it queues them, you get the live queue. |
| [`crosspost`](skills/crosspost/) | Cross-posts one short video or idea to TikTok, Instagram Reels, YouTube Shorts, Facebook, LinkedIn, Bluesky and more, a native caption per network, and returns every live link. |
| [`tiktok-upload`](skills/tiktok-upload/) | Uploads and publishes (or schedules) a video or photo carousel to TikTok through the official Content Posting API: no developer app, no cookies. |
| [`instagram-post`](skills/instagram-post/) | Publishes or schedules an Instagram photo, carousel (up to 10) or Reel through the official API, business or creator accounts. |
| [`postwire`](skills/postwire/) | Connects the agent to PostWire and publishes your first post. |

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
