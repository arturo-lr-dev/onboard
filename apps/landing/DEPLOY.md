# Deployment Guide

## Quick Deploy (Vercel)

1. Push to GitHub
2. Connect repo to Vercel: https://vercel.com/new
3. Vercel auto-detects Astro, no config needed
4. Deploy!

**Environment variables:** None required for landing (static site)

---

## Alternative: Netlify

1. Push to GitHub
2. Connect repo to Netlify: https://app.netlify.com/start
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy!

---

## Manual Deploy

```bash
npm run build
# Output in: dist/
# Upload to any static host (S3, Cloudflare Pages, etc.)
```

---

## Form Setup (Important!)

The contact form uses **Formspree** (free tier: 50 submissions/month).

### Setup:
1. Go to https://formspree.io/
2. Create free account
3. Create new form
4. Copy your form endpoint (e.g., `https://formspree.io/f/YOUR_FORM_ID`)
5. Update `src/components/ContactForm.astro`:
   ```html
   <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```

### Alternative: Custom Backend
If you want to store leads yourself:
- Create API endpoint (Vercel Serverless, Supabase, etc.)
- Update form action URL
- Store in database of choice

---

## Custom Domain

### Vercel:
1. Go to Project Settings → Domains
2. Add your domain (e.g., `onboard.ai`)
3. Update DNS records as instructed

### Namecheap/GoDaddy DNS:
```
Type: CNAME
Host: @
Value: cname.vercel-dns.com
```

---

## Analytics (Optional)

Add to `src/layouts/Layout.astro`:

**Plausible** (privacy-friendly):
```html
<script defer data-domain="onboard.ai" src="https://plausible.io/js/script.js"></script>
```

**Google Analytics**:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

---

## Performance Checklist

- ✅ Static site (no SSR overhead)
- ✅ Tailwind purges unused CSS
- ✅ GSAP animations are lazy-loaded
- ✅ Fonts preconnect for faster load
- ✅ Zero JavaScript required for initial paint

**Expected Lighthouse score: 95-100**

---

**Need help?** Open an issue on GitHub.
