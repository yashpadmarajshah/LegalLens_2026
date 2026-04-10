# LegalLens ⚖️
### We read the boring stuff so you don't have to

A SaaS web application that takes any Terms of Service or Privacy Policy and instantly returns a plain-language summary — powered by Sarvam AI's `sarvam-30b` model.

Built as part of the Cloud Computing course SaaS project.

---

## Features

- **3 input methods** — paste text, upload PDF/DOCX, or fetch from a URL
- **4 analysis modes** — Full summary, Privacy focus, Your rights, Red flags only
- **Trust score** — 1–10 rating with color coding (red/amber/green)
- **One-liner** — a single casual sentence summarizing what you're agreeing to
- **Togglable cards** — plain English by default, click to reveal the original legal clause
- **Shareable links** — compress and encode the full summary into a URL hash

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| AI Model | Sarvam AI `sarvam-30b` (64K context) |
| PDF parsing | PDF.js (Mozilla) |
| DOCX parsing | Mammoth.js |
| URL fetching | allorigins.win CORS proxy |
| Share links | LZString compression → URL hash |
| Deployment | Vercel |

---

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/legallens.git
cd legallens
```

### 2. Install dependencies
```bash
npm install
```

### 3. Add your Sarvam API key
```bash
cp .env.example .env
```
Then open `.env` and replace `your_sarvam_api_key_here` with your actual key from [dashboard.sarvam.ai](https://dashboard.sarvam.ai).

> Sarvam gives ₹100 free credits on signup — enough for hundreds of calls.

### 4. Run locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

---

## Deploying to Vercel

1. Push your code to GitHub (make sure `.env` is in `.gitignore`)
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. In **Environment Variables**, add:
   - Key: `VITE_SARVAM_KEY`
   - Value: your Sarvam API key
4. Click **Deploy** — done in ~2 minutes

---

## Project Structure

```
src/
├── components/
│   ├── InputPanel.jsx       # Paste / Upload / URL input tabs
│   ├── ModeSelector.jsx     # Full / Privacy / Rights / Red flags
│   ├── ScoreBadge.jsx       # 1–10 trust score with color bar
│   ├── OneLineSummary.jsx   # Friendly one-liner at the top
│   ├── SummaryCard.jsx      # Result card with original clause toggle
│   ├── ShareButton.jsx      # Copy shareable link
│   └── SkeletonLoader.jsx   # Loading skeleton UI
├── utils/
│   ├── sarvamApi.js         # Sarvam API call + prompt engineering
│   ├── extractText.js       # PDF.js + Mammoth + URL fetch
│   └── shareLink.js         # LZString encode/decode for URL sharing
├── App.jsx                  # Main layout + state
└── main.jsx                 # React entry point
```

---

## Note on API Key Security

The API key is stored in a `.env` file and accessed via `import.meta.env.VITE_SARVAM_KEY`. For this assignment/demo this is fine. In a production app, you would proxy the API call through a serverless backend function to keep the key hidden.

---

*Built with Sarvam AI — India's sovereign AI platform*
