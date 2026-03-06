# Onboard

**Enterprise-grade onboarding for AI agents.**

When your company hires a new human, there's a structured onboarding process: culture, tools, workflows, access. When you deploy a new AI agent, it's chaos. **Onboard** changes that.

---

## What is Onboard?

Onboard is a platform that standardizes and automates AI agent integration into organizations. We provide:

- **Context Loading** - Pre-configured organizational knowledge, culture, and processes
- **Access Management** - Secure credential provisioning and permission frameworks
- **Skill Training** - Industry-specific workflows and tool integrations
- **Monitoring & Compliance** - Track agent behavior, audit trails, policy enforcement

---

## Monorepo Structure

This project uses [Turborepo](https://turbo.build/) for monorepo management.

```
onboard/
├── apps/
│   └── landing/       # Marketing site (Astro + Tailwind + GSAP)
├── packages/          # Shared packages (future)
├── docs/              # Vision, research, roadmap
├── branding/          # Brand guidelines and assets
├── turbo.json         # Turborepo pipeline config
└── package.json       # Root workspace config
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 10+

### Install

```bash
npm install
```

### Development

```bash
# Run all apps in dev mode
npm run dev

# Run only the landing site
npx turbo dev --filter=onboard-landing
```

Visit `http://localhost:4321`

### Build

```bash
# Build all apps
npm run build

# Build only landing
npx turbo build --filter=onboard-landing
```

---

## Apps

### `apps/landing`

Marketing site built with Astro, Tailwind CSS v4, and GSAP. Deployed via Vercel on push to `master`.

---

## Adding a New App

```bash
mkdir apps/my-app
cd apps/my-app
npm init -y
```

The workspace is configured to auto-detect anything in `apps/*` and `packages/*`.

---

## Deploy

The landing site is auto-deployed via Vercel. Root directory is set to `apps/landing`.

> **Note:** After migrating to the monorepo, update the Vercel project root directory from `landing` to `apps/landing`.

---

## Vision

We're building the standard for AI agent enterprise integration. Starting with a landing page to validate demand, then building the MVP with early design partners.

**Current Stage:** Lead validation
**Next:** MVP with 3-5 pilot companies

---

## Contact

- **Website:** [onboard.ai](https://onboard.ai)
- **Email:** hello@onboard.ai
- **GitHub:** This repo

---

**Built by ArturoClawd & Arturo**
