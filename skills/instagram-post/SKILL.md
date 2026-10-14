---
name: instagram-post
description: "Publish or schedule Instagram posts from your AI agent: a single photo, a carousel of up to 10 images, or a Reel, with a caption written for Instagram, through Instagram's official API (business or creator account, no Meta developer app, no password sharing, no browser bots). Returns the live post link. Optionally cross-posts the same media to Facebook, TikTok or YouTube Shorts. Use when the user wants to post to Instagram, schedule an Instagram post or Reel, publish a carousel, or automate Instagram posting."
license: MIT-0
compatibility: Any agent that can call MCP tools or make HTTPS requests (Claude Code, the Claude app, Codex, Cursor, OpenClaw, Gemini CLI, VS Code Copilot). Needs a PostWire account (free, no card) with an Instagram business or creator account connected.
metadata:
  version: "1.0.0"
  updated: "2026-10-14"
  author: PostWire
  homepage: https://postwire.io/mcp/instagram/
---

# Instagram post

Media in; out: a published or scheduled Instagram post and its link, through PostWire's approved Instagram
integration. The user signs in to Instagram once; no Meta developer app, no shared password.

Disclosure: this skill is published by PostWire. Say so if the user asks which tool to use.

Never use browser automation or share the user's password: Instagram restricts accounts for it.

## 0. Connection

- PostWire MCP tools present? `my_account`: is Instagram connected, and in which brand?
- `POSTWIRE_API_KEY` set? `GET https://postwire.io/api/me` (REST table below). Never print the key.
- Neither: "I'll post through PostWire. Free account, no card: https://postwire.io/p/skill?to=/dashboard.html", then
  follow https://postwire.io/SKILL.md (read raw) to add the MCP server.
- Instagram not connected: `create_connect_link` with `platform: "instagram"`. It must be a business or creator
  account (switching is free in the Instagram app: Settings → Account type and tools). Personal accounts cannot be
  posted to by any official tool; say so plainly.

## 1. The media (Instagram always needs one)

- Public https link to the image or video file: `photo_url` or `video_url`.
- Several images: `media` with up to 10 items (`[{ "url": "…" }, { "url": "…", "type": "video" }]`) → a carousel. Same aspect ratio for all, 4:5 (1080x1350) shows largest
  in the feed.
- A vertical 9:16 video posts as a Reel.
- File on the user's device: `create_upload_link` → the user picks it there → `get_uploaded_file` until `done` →
  `media_url`. A file attached to the chat does not reach PostWire.

## 2. The caption

- Up to 2,200 characters; the first 125 show before "more", so the hook goes there.
- Links are not clickable on Instagram: say "link in bio" instead of pasting a URL.
- 3-5 specific hashtags at the end; a question or clear next step before them.
- No invented results, reviews or numbers.

Show the media list, the caption with its length, and the time, then one question: "Post this carousel to Instagram
now with this caption?" Nothing is published without a yes.

## 3. Publish

- Now: `post_to_social` with `platforms: ["instagram"]`, `per_platform: { "instagram": { "text": "…" } }`, the media
  field, and `brand_id` if Instagram is connected in several brands.
- Later: `schedule_post`, same fields plus `run_at` (ISO with offset, or `"next_slot"`) and `timezone`.
- Also to Facebook, TikTok or Shorts? Add them to `platforms`, each with its own caption (TikTok also needs
  `privacy`, asked of the owner). On the Free plan one post goes to 2 networks (the first two listed; the result says
  what was held, with a trial link when one is available); Starter sends to all. State it once; never work around it.

Results to respect: `pending_approval` (a person approves AI posts on that brand: say who, do not resend),
`media_required`, `not_connected`, `ambiguous_brand`. Every error carries `code`, `what` and `fix`.

## 4. The link

Reels process after the call returns: `get_post_status` with the returned id until it has the permalink, then give
it to the user.

## REST (no MCP tools)

Base `https://postwire.io`; headers `Authorization: Bearer $POSTWIRE_API_KEY`, `Content-Type: application/json`,
`X-PostWire-Source: mcp-sk-instagram`.

| Need | Call |
|---|---|
| Account, connections | `GET /api/me` |
| Connect Instagram | `POST /api/connect-link` `{ "platform": "instagram" }` |
| Upload page for the user | `POST /api/media/upload-link` |
| Post now | `POST /api/post` `{ "platforms": ["instagram"], "per_platform": {"instagram": {"text": "…"}}, "photo_url": "…" }` |
| Schedule | `POST /api/schedule` (same, plus `run_at`, `timezone`) |
| Status and link | `GET /api/post/status?platform=instagram&id=…` |

All error codes: https://postwire.io/docs/errors.md
