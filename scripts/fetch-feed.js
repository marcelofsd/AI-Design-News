// scripts/fetch-feed.js
// Generates feed.json every Sunday via GitHub Actions
// Requires: ANTHROPIC_API_KEY environment variable

import fetch from 'node-fetch';
import { writeFileSync } from 'fs';

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) { console.error("❌ Missing ANTHROPIC_API_KEY"); process.exit(1); }

const MODEL = "claude-sonnet-4-5";
const API_URL = "https://api.anthropic.com/v1/messages";

const QUERIES = [
  { src: "Seedream / ByteDance", topic: ["img","people"],     tint: "a", q: "Seedream ByteDance image generation AI architecture visualization 2025 2026" },
  { src: "Seedance",             topic: ["i2v","v2v"],         tint: "b", q: "Seedance SeedVR ByteDance video generation architecture 2025 2026" },
  { src: "Kling AI",             topic: ["i2v","v2v"],         tint: "h", dark: true, q: "Kling AI 2.0 video generation architecture interior design 2025 2026" },
  { src: "Google DeepMind",      topic: ["img","i2v"],         tint: "c", q: "Google Veo Nano Banana DeepMind image video generation architecture 2025 2026" },
  { src: "Runway ML",            topic: ["v2v","i2v"],         tint: "e", q: "Runway ML Gen4 video architecture visualization retexture 2025 2026" },
  { src: "Stability AI",         topic: ["img","material"],    tint: "f", q: "Stable Diffusion 3.5 architecture interior rendering material texture 2025 2026" },
  { src: "Midjourney",           topic: ["img"],               tint: "d", q: "Midjourney v7 architecture visualization style reference 2025 2026" },
  { src: "Adobe Firefly",        topic: ["img","integrations"],tint: "g", q: "Adobe Firefly architecture room depth EXR generate replace 2025 2026" },
  { src: "Hugging Face",         topic: ["model","material"],  tint: "b", q: "Hugging Face 3D model generation texture PBR architecture 2025 2026" },
  { src: "LinkedIn",             topic: ["img","i2v"],         tint: "a", isLinkedin: true, q: "architect interior designer AI workflow test comparison LinkedIn 2025 2026" },
  { src: "LinkedIn",             topic: ["v2v","model"],       tint: "c", isLinkedin: true, q: "archviz AI Kling Runway Seedance video material comparison LinkedIn 2025 2026" },
];

const SYSTEM = `You are an AI news curator for architects and visualization artists.
Search for 2 recent, real, specific articles or posts about the topic from 2025-2026.
Respond ONLY as a valid JSON array — no markdown, no preamble:
[{"title":"...","url":"...","exc":"1-sentence teaser","summary":"2 sentences on archviz relevance","date":"Mon DD, YYYY","pop":number 50-99,"trending":boolean}]
If nothing genuinely found, return [].`;

async function getThumb(url) {
  if (!url || url === "#") return null;
  try {
    const r = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}&meta=false`, { timeout: 8000 });
    const d = await r.json();
    return d?.data?.image?.url || null;
  } catch { return null; }
}

async function callClaude(userMsg) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      system: SYSTEM,
      messages: [{ role: "user", content: userMsg }],
      tools: [{ type: "web_search_20250305", name: "web_search" }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.content.map(b => b.type === "text" ? b.text : "").filter(Boolean).join("\n");
}

async function main() {
  const articles = [];
  const now = Date.now();
  console.log("🗞  A.i. Design News — weekly fetch starting\n");

  for (let i = 0; i < QUERIES.length; i++) {
    const q = QUERIES[i];
    console.log(`[${i+1}/${QUERIES.length}] ${q.src}`);

    try {
      const raw = await callClaude(`Search: "${q.q}". Return JSON array of 2 results.`);
      let parsed = [];
      try {
        const clean = raw.replace(/```json|```/g, "").trim();
        const s = clean.indexOf("["), e = clean.lastIndexOf("]");
        if (s !== -1 && e !== -1) parsed = JSON.parse(clean.slice(s, e + 1));
      } catch(pe) { console.warn("  ⚠ Parse error:", pe.message); }

      for (let j = 0; j < Math.min(parsed.length, 2); j++) {
        const item = parsed[j];
        console.log(`  ✓ ${(item.title || "").slice(0, 70)}`);
        const thumb = await getThumb(item.url);
        articles.push({
          src: q.src,
          topic: q.topic || [],
          tint: q.tint || "a",
          dark: q.dark || false,
          isLinkedin: q.isLinkedin || false,
          hot: !!item.trending,
          title: item.title || "Untitled",
          href: item.url || "#",
          exc: item.exc || item.summary || "",
          summary: item.summary || item.exc || "",
          date: item.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          pop: item.pop || 60,
          thumb: thumb || null,
          ph: q.src.toLowerCase().replace(/\s+/g, "-"),
          ts: now - i * 1000 - j * 100,
        });
      }
    } catch(e) {
      console.error(`  ✗ ${e.message}`);
    }

    // Polite pacing
    await new Promise(r => setTimeout(r, 1500));
  }

  const feed = {
    updated: new Date().toISOString(),
    count: articles.length,
    articles,
  };

  writeFileSync("feed.json", JSON.stringify(feed, null, 2));
  console.log(`\n✅ Done — ${articles.length} articles written to feed.json`);
}

main().catch(e => { console.error(e); process.exit(1); });
