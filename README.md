# Hogback Tech Website

A modern marketing site for [Hogback Tech](https://hogbacktech.com) — software, applications, and engagement.

## Tech Stack

- **Next.js 15** with App Router
- **React 19**
- **Tailwind CSS 4**
- **TypeScript**
- Static export for Cloudflare Pages deployment

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site locally.

## Build

```bash
npm run build
```

The static site is exported to the `out/` directory.

## Deploy to Cloudflare Pages

Since your domain is already registered with Cloudflare, deploying is straightforward:

1. Push this project to a GitHub or GitLab repository
2. In the [Cloudflare Dashboard](https://dash.cloudflare.com), go to **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. Select your repository and configure the build:
   - **Framework preset:** Next.js (Static HTML Export)
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
   - **Node.js version:** 20 or later
4. Click **Save and Deploy**
5. Once deployed, go to **Custom domains** and add `hogbacktech.com` and `www.hogbacktech.com`

### Email Setup (Optional)

To use `hello@hogbacktech.com`, configure email routing in Cloudflare:

1. Go to **Email** → **Email Routing** in your Cloudflare dashboard
2. Add a custom address `hello@hogbacktech.com` that forwards to your personal email

## Project Structure

```
src/
├── app/
│   ├── layout.tsx      # Root layout, fonts, SEO metadata
│   ├── page.tsx        # Homepage
│   └── globals.css     # Global styles & theme
└── components/
    ├── Header.tsx      # Navigation
    ├── Hero.tsx        # Hero section
    ├── Services.tsx    # Software, Apps, Engagement
    ├── Approach.tsx    # Process overview
    ├── About.tsx       # Company info
    ├── Contact.tsx     # Contact form
    └── Footer.tsx      # Site footer
```

## Customization

- Update contact email in `Footer.tsx` and `Contact.tsx`
- Modify service offerings in `Services.tsx`
- Adjust brand colors in `globals.css` (`@theme` block)
