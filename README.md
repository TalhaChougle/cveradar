# CVERadar 🛡️

A real-time vulnerability intelligence tool built on the NIST NVD and CISA KEV databases. Search 200,000+ CVEs instantly, understand what they mean in plain English, and stay on top of actively exploited vulnerabilities.

![CVERadar](https://img.shields.io/badge/NVD-Live-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![React](https://img.shields.io/badge/React-18-blue)

---

## What it does

- 🔍 **Search** any CVE by ID (e.g. `CVE-2021-44228`) or keyword (e.g. `apache`, `openssl`)
- 📡 **Live feed** — loads the latest published CVEs automatically on startup, refreshes every 3 minutes
- ⚠️ **CISA KEV badges** — flags vulnerabilities confirmed to be actively exploited in the wild
- 📊 **Plain English explanations** — severity, attack method, damage potential, all explained for non-technical users
- 🩹 **Patch links** — separates official fixes from exploit reports
- 📱 **Fully responsive** — works on mobile, tablet, and desktop
- ♾️ **Infinite scroll** — paginated results, loads more as you scroll

---

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite 5 |
| Styling | CSS Modules (no Tailwind, no UI library) |
| Data | [NIST NVD REST API v2](https://nvd.nist.gov/developers/vulnerabilities) |
| Exploits | [CISA KEV JSON feed](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) |
| Hosting | Netlify (static, no backend) |

---

## Getting started

### Prerequisites
- Node.js 18+
- npm

### Run locally

```bash
git clone https://github.com/YOUR_USERNAME/cveradar.git
cd cveradar
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build for production

```bash
npm run build
```

Output goes to `dist/`.

---

## Deploy to Netlify

### Option 1 — GitHub integration (recommended)

1. Push this repo to GitHub
2. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from GitHub**
3. Select this repo
4. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **Deploy** — done

Every `git push` to `main` triggers an automatic redeploy.

### Option 2 — Netlify CLI

```bash
npm run build
npx netlify deploy --prod --dir=dist
```

---

## API keys

No API key is required. The app works out of the box using public endpoints.

| API | Limit without key | Limit with free key |
|-----|-------------------|---------------------|
| NIST NVD | 5 req / 30 sec | 50 req / 30 sec |
| CISA KEV | Unlimited | — |

To use an NVD API key, get one free at [nvd.nist.gov/developers/request-an-api-key](https://nvd.nist.gov/developers/request-an-api-key), then update `src/utils/nvd.js`:

```js
const res = await fetch(url, {
  headers: {
    'Accept': 'application/json',
    'apiKey': 'your-key-here'
  }
})
```

---

## How the proxy works

The `vite.config.js` proxies NVD/CISA requests through `/nvd-api` and `/cisa-api` locally to avoid CORS issues. On Netlify, `netlify.toml` handles the same rewrites in production — no backend or serverless functions needed.

---

## Project structure

```
src/
├── components/
│   ├── TopBar          — Header with live indicator
│   ├── SearchBar       — Search input + severity/year filters
│   ├── CVECard         — Result list card
│   ├── DetailPanel     — Full CVE detail view
│   ├── EmptyState      — Landing screen with quick searches
│   └── Skeleton        — Loading shimmer cards
├── hooks/
│   ├── useSearch       — NVD search with abort + pagination
│   └── useLatestCVEs   — Auto-loading latest CVE feed
└── utils/
    ├── nvd.js          — NVD API client + parser
    └── severity.js     — CVSS severity color helpers
```

---

## License

MIT — free to use, modify, and deploy.

---

## Data sources

- [NIST National Vulnerability Database](https://nvd.nist.gov)
- [CISA Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)
- [MITRE CVE Program](https://cve.mitre.org)
