# CVERadar 🛡️

Real-time CVE lookup tool powered by the [NIST NVD API v2](https://nvd.nist.gov/developers/vulnerabilities) and [CISA KEV feed](https://www.cisa.gov/known-exploited-vulnerabilities-catalog).

## Features

- 🔍 Search 200,000+ CVEs by ID or keyword (live NVD data)
- 🎯 Filter by severity (Critical / High / Medium / Low) and year
- 📊 Full CVSS v3.1 scores, vectors, and severity bars
- ⚠️ CISA KEV badge — flags actively exploited vulnerabilities
- 🔗 Affected products, CWE weaknesses, references
- ♾️ Infinite scroll pagination
- ⚡ Zero backend — pure client-side, works on Netlify

## Local Development

```bash
npm install
npm run dev
# Open http://localhost:5173
```

## Deploy to Netlify

### Option 1 — Netlify CLI
```bash
npm run build
npx netlify deploy --prod --dir=dist
```

### Option 2 — GitHub integration
1. Push this repo to GitHub
2. Go to [netlify.com](https://netlify.com) → New site from Git
3. Select your repo
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy — done.

The `netlify.toml` handles proxy rewrites so NVD API calls work in production without CORS issues.

## NVD API Key (optional)

Without a key: 5 requests/30 seconds — fine for personal use.
With a free key: 50 requests/30 seconds.

Get one at https://nvd.nist.gov/developers/request-an-api-key

Then create `.env.local`:
```
VITE_NVD_API_KEY=your-key-here
```

And update `src/utils/nvd.js` to pass it as header:
```js
headers: {
  'apiKey': import.meta.env.VITE_NVD_API_KEY ?? '',
}
```

## Tech Stack

- Vite + React 18
- CSS Modules (no Tailwind, no UI lib)
- NIST NVD REST API v2
- CISA KEV JSON feed
