# A.i. Design News

Weekly intelligence feed for creative AI tools relevant to architecture and visualization. Editorial newspaper design. Articles fetched and summarized by Claude every Sunday via GitHub Actions, with thumbnails via Microlink.

---

## Deploy to GitHub Pages — 5 steps

### 1. Create a GitHub repo
Go to https://github.com/new → create a public repo called `ai-design-news`.

### 2. Push this folder
```bash
git init && git add . && git commit -m "init"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-design-news.git
git push -u origin main
```

### 3. Add your API key
Repo → **Settings → Secrets and variables → Actions → New secret**
- Name: `ANTHROPIC_API_KEY`
- Value: your key from https://console.anthropic.com/

### 4. Enable GitHub Pages
Repo → **Settings → Pages → Deploy from branch → main / root → Save**

Live at: `https://YOUR_USERNAME.github.io/ai-design-news/`

### 5. First fetch
**Actions → Weekly Feed Refresh → Run workflow**

After that, runs automatically every Sunday 07:00 CET.

---

## Run locally
```bash
npm install
ANTHROPIC_API_KEY=sk-ant-xxx npm run fetch   # populates feed.json
npx serve . -p 3000                           # opens at localhost:3000
```

---

## For external hosting (API key)
Add before `</body>` in index.html:
```html
<script>const ANTHROPIC_API_KEY = "sk-ant-YOUR_KEY";</script>
```
Keep the page private — the key will be visible in source.

---

## Cost estimate
| | Free tier | Used |
|---|---|---|
| GitHub Pages + Actions | Free / 2000 min/month | ~6 min/week |
| Microlink thumbnails | 100 req/day free | ~22/week |
| Anthropic API | Pay-as-you-go | ~$0.05–0.15/refresh |
