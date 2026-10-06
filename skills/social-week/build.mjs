#!/usr/bin/env node
// Builds every published form of the social-week skill from the one source, skills/social-week/SKILL.md:
//
//   public/skills/social-week/SKILL.md     served at https://postwire.io/skills/social-week/SKILL.md, byte for byte
//                                          (also listed in /.well-known/agent-skills/index.json with its sha256)
//   public/skills/social-week/social-week.zip   the Claude app upload (Customize -> Skills): a social-week/ folder
//   dist/clawhub/social-week/              the ClawHub publish folder: the same SKILL.md plus metadata.openclaw
//
//   node skills/social-week/build.mjs            write them
//   node skills/social-week/build.mjs --check    exit 1 if any of them is out of date (test/skill-social-week-unit.mjs)
//
// The zip is deterministic (fixed dates, fixed order), so rebuilding without a change changes no byte.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "../..");
const SRC = path.join(HERE, "SKILL.md");
const SCRIPT = path.join(HERE, "scripts/schedule-week.mjs");
export const OUT = {
  publicSkill: path.join(ROOT, "public/skills/social-week/SKILL.md"),
  zip: path.join(ROOT, "public/skills/social-week/social-week.zip"),
  clawhubSkill: path.join(HERE, "dist/clawhub/social-week/SKILL.md"),
  clawhubScript: path.join(HERE, "dist/clawhub/social-week/scripts/schedule-week.mjs"),
};

// ClawHub reads its runtime metadata from metadata.openclaw (docs/skill-format.md in openclaw/clawhub). The Agent
// Skills spec keeps metadata to string values, so this block only exists in the ClawHub copy.
const OPENCLAW = `  openclaw:
    homepage: https://postwire.io/skills/social-week/
    primaryEnv: POSTWIRE_API_KEY
    envVars:
      - name: POSTWIRE_API_KEY
        required: false
        description: PostWire API key, only for the REST path. Not needed when the PostWire MCP server is connected (browser sign-in). Read from the environment, never printed.
      - name: POSTWIRE_BASE_URL
        required: false
        description: Only to test scripts/schedule-week.mjs against another server. Default https://postwire.io.
`;
export function clawhubVariant(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) throw new Error("SKILL.md has no frontmatter");
  const version = (m[1].match(/^\s+version:\s*"?([0-9.]+)"?/m) || [])[1];
  if (!version) throw new Error("metadata.version missing");
  const fm = `version: ${version}\n` + m[1] + "\n" + OPENCLAW.trimEnd();
  return `---\n${fm}\n---\n` + md.slice(m[0].length);
}

// --- a minimal ZIP writer (stored entries, CRC-32), enough for a Claude app skill upload ---------------------------
const CRC = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
export const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const DOS_TIME = 0, DOS_DATE = ((2026 - 1980) << 9) | (10 << 5) | 6; // 2026-10-06 00:00, fixed
export function zip(entries) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name, "utf8"), crc = crc32(data), deflated = zlib.deflateRawSync(data, { level: 9 });
    const useDeflate = deflated.length < data.length, body = useDeflate ? deflated : data, method = useDeflate ? 8 : 0;
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6); lh.writeUInt16LE(method, 8);
    lh.writeUInt16LE(DOS_TIME, 10); lh.writeUInt16LE(DOS_DATE, 12); lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(body.length, 18); lh.writeUInt32LE(data.length, 22); lh.writeUInt16LE(nameBuf.length, 26); lh.writeUInt16LE(0, 28);
    locals.push(lh, nameBuf, body);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0800, 8); ch.writeUInt16LE(method, 10);
    ch.writeUInt16LE(DOS_TIME, 12); ch.writeUInt16LE(DOS_DATE, 14); ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(body.length, 20);
    ch.writeUInt32LE(data.length, 24); ch.writeUInt16LE(nameBuf.length, 28); ch.writeUInt32LE(offset, 42);
    centrals.push(ch, nameBuf);
    offset += 30 + nameBuf.length + body.length;
  }
  const cd = Buffer.concat(centrals), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, end]);
}
// Reads back what zip() wrote (and any stored/deflated zip without data descriptors): [{ name, data }].
export function unzip(buf) {
  const out = [];
  let i = 0;
  while (buf.readUInt32LE(i) === 0x04034b50) {
    const method = buf.readUInt16LE(i + 8), size = buf.readUInt32LE(i + 18), n = buf.readUInt16LE(i + 26), x = buf.readUInt16LE(i + 28);
    const name = buf.subarray(i + 30, i + 30 + n).toString("utf8"), raw = buf.subarray(i + 30 + n + x, i + 30 + n + x + size);
    out.push({ name, data: method === 8 ? zlib.inflateRawSync(raw) : Buffer.from(raw), crc: buf.readUInt32LE(i + 14) });
    i += 30 + n + x + size;
  }
  return out;
}

export function build() {
  const md = fs.readFileSync(SRC);
  const script = fs.readFileSync(SCRIPT);
  return {
    [OUT.publicSkill]: md,
    [OUT.zip]: zip([{ name: "social-week/SKILL.md", data: md }, { name: "social-week/scripts/schedule-week.mjs", data: script }]),
    [OUT.clawhubSkill]: Buffer.from(clawhubVariant(md.toString("utf8")), "utf8"),
    [OUT.clawhubScript]: script,
  };
}

if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, "/").replace(/^\//, "")}` || process.argv[1]?.endsWith("build.mjs")) {
  const check = process.argv.includes("--check");
  let stale = 0;
  for (const [file, data] of Object.entries(build())) {
    const same = fs.existsSync(file) && fs.readFileSync(file).equals(data);
    if (check) { if (!same) { stale++; console.log("out of date:", path.relative(ROOT, file)); } continue; }
    if (same) continue;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, data);
    console.log("wrote", path.relative(ROOT, file), data.length, "bytes");
  }
  if (check) { console.log(stale ? `${stale} file(s) out of date: node skills/social-week/build.mjs` : "social-week build: up to date"); process.exit(stale ? 1 : 0); }
}
