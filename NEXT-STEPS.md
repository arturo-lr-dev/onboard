# Next Steps - Onboard Launch

## What's Done

**GitHub Repo:** https://github.com/arturo-lr-dev/onboard

**Deliverables:**
- Complete landing page (Astro + Tailwind + GSAP) - redesigned with precision infrastructure aesthetic
- Vision document (why we're building this)
- Market research (TAM/SAM/SOM, competition, pricing)
- Roadmap (Phase 0 to Phase 4)
- Brand guidelines (colors, voice, design principles)
- Deployment guide
- Monorepo setup with Turborepo

---

## Deploy the Landing

### Vercel (Recommended)

1. Go to https://vercel.com/new
2. Import `arturo-lr-dev/onboard` from GitHub
3. Set **Root Directory:** `apps/landing`
4. Deploy!
5. Add custom domain (e.g., `onboard.ai` or `getonboard.io`)

### Netlify

1. Go to https://app.netlify.com/start
2. Connect GitHub repo
3. Set **Base directory:** `apps/landing`
4. Set **Build command:** `npm run build`
5. Set **Publish directory:** `apps/landing/dist`
6. Deploy!

---

## Contact Form

The form is connected to Formspree (`xreygybr`). Submissions go to your Formspree dashboard.

---

## Drive Traffic

### Week 1: Launch

**LinkedIn:**
- Post announcement from your personal account
- Focus on the problem: "Companies are deploying AI agents with zero onboarding infrastructure"
- Link to landing

**Twitter/X:**
- Thread about agent onboarding challenges
- Tag relevant accounts: @AnthropicAI, AI influencers
- Use hashtags: #AIAgents #LLMOps #DevTools

**GitHub:**
- Add topics: `ai-agents`, `devops`, `llm-ops`, `enterprise-ai`
- Share in relevant communities (r/ClaudeAI, r/ChatGPTCoding)

### Week 2-4: Outreach

- Direct outreach to AI-first startups (Product Hunt, Twitter)
- Companies posting "AI engineer" roles (LinkedIn jobs)
- Blog post: "The Hidden Cost of Ad-Hoc Agent Deployment"

---

## Success Metrics (Month 1)

**Primary goal:** 100+ qualified leads

"Qualified" = work email, company name, managing or planning to manage 1+ agents

**Secondary goals:**
- 10+ companies respond to outreach
- 5+ interviews scheduled
- 2-3 design partners committed to pilot

---

## Next Phase: MVP

Once you have 20-30 qualified leads + 3-5 pilot commitments:
- Build core platform (agent profiles, knowledge bases, access dashboard)
- Add as `apps/platform` in the monorepo
- Tech stack: Next.js + PostgreSQL + Node.js
- Shared packages in `packages/` (UI components, types, config)

---

## Monorepo Next Steps

The Turborepo monorepo is ready for growth:

```
apps/
  landing/     # Done
  platform/    # MVP app (Next.js) - future
  docs-site/   # Public docs site - future
packages/
  ui/          # Shared UI components - future
  config/      # Shared ESLint/TS config - future
  types/       # Shared TypeScript types - future
```

To add a new app: `mkdir apps/my-app && cd apps/my-app && npm init -y`

---

**Let's build this.**
