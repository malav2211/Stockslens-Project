# Stocklens

Stocklens is a responsive stock-market research dashboard. Search a US-listed company by name or ticker to view its latest market price, historical performance, annual profit-and-loss figures, market statistics, and current news.

Live demo: [stocklens-market-tracker.malav2211.chatgpt.site](https://stocklens-market-tracker.malav2211.chatgpt.site)

## Features

- Company-name and ticker-symbol search
- Latest price, daily movement, market cap, volume, dividend yield, and analyst target
- Interactive 1-month, 3-month, 1-year, and 5-year history
- Annual revenue, gross profit, operating income, and net income
- Current company and stock-market news
- Responsive desktop and mobile layout
- Server-side market-data endpoint with graceful error handling

## Tech stack

- React 19 and TypeScript
- vinext / Vite
- Tailwind CSS
- Cloudflare Workers-compatible server output
- Nasdaq market data and Google News RSS

## Run locally

You need Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm run build
npm run start
```

## Important files

- `app/page.tsx` — dashboard interface and client interactions
- `app/api/stock/route.ts` — company search, market data, financials, history, and news
- `app/globals.css` — visual design and responsive styles
- `app/layout.tsx` — page metadata and social preview configuration
- `public/og.png` — social-sharing preview image
- `package.json` — dependencies and development commands
- `.openai/hosting.json` — Sites deployment configuration

## GitHub upload

### Upload through the GitHub website

1. Create a new empty repository on GitHub.
2. Extract `stocklens-github-ready.zip`.
3. On the repository page, select **Add file → Upload files**.
4. Drag all extracted files and folders into GitHub.
5. Add a commit message such as `Initial Stocklens project` and select **Commit changes**.

### Upload with Git

```bash
git init
git add .
git commit -m "Initial Stocklens project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Do not upload `node_modules`, `.env` files, `dist`, `.wrangler`, or local build/cache folders. They are already excluded by `.gitignore`.

## Data notice

Market data is for informational purposes and may be delayed. Stocklens does not provide investment advice.
