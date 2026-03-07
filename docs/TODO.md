# TODO - Onboard Launch

**Producto:** Onboarding empresarial para agentes IA
**Dominio:** https://ianding.es/
**Launch:** Lunes 10 de marzo en Product Hunt

---

## Hecho

- [x] Landing desplegada en Vercel con dominio ianding.es
- [x] Google Analytics 4 (G-4WZ2L1ZNMN)
- [x] Microsoft Clarity (vryvc4518o)
- [x] Eventos custom: cta_click, email_submit, section views
- [x] UTM tracking con persistencia en sessionStorage
- [x] Formspree configurado (xreygybr)
- [x] Product Hunt configurado y listo (nombre: Onboard, tagline, descripcion, gallery, shoutouts, tags)
- [x] Favicon con branding (SVG + PNG)
- [x] Multiidioma (es, en, it, fr, de)
- [x] SEO (OG tags, sitemap, JSON-LD, robots.txt)

---

## Antes del lunes 10 (Pre-Launch)

### GA4 - Configuracion final
- [ ] Visitar ianding.es con UTM de prueba, verificar en GA4 Realtime
- [ ] Marcar `email_submit` como conversion en GA4 Admin > Events
- [ ] Marcar `cta_click` como conversion en GA4 Admin > Events

### Formspree
- [ ] Enviar un email de prueba desde el formulario
- [ ] Verificar que llega al dashboard de Formspree

### Product Hunt - Listo
- [x] Nombre: Onboard (corregido de "ianding")
- [x] Tagline: "Enterprise-Grade Onboarding for AI Agents"
- [x] Descripcion completa
- [x] Gallery: 5 screenshots (hero, problem, solution, who, contact)
- [x] Shoutouts: PostHog + otros
- [x] Tags: Artificial Intelligence + otros
- [x] Fecha: corregida
- [ ] Preparar maker comment para el dia del launch
- [ ] Avisar a 3-5 contactos para upvote temprano

### Google Ads - Preparar campana
- [ ] Crear cuenta de Google Ads (si no la tienes)
- [ ] Crear campana de busqueda con keywords:
  - "ai agent deployment"
  - "ai agent management platform"
  - "deploy ai agents enterprise"
  - "ai agent governance"
  - "ai agent onboarding"
- [ ] Copy del anuncio:
  - Headline: "AI Agent Onboarding Platform | Enterprise-Ready"
  - Description: "Deploy agents with context, access & compliance. From $49/agent/mo."
- [ ] URL: `ianding.es?utm_source=google&utm_medium=cpc&utm_campaign=validation`
- [ ] Presupuesto: 10-15 EUR/dia durante 7 dias
- [ ] Programar activacion para el lunes 10

### Contenido - Preparar posts
- [ ] Escribir post de LinkedIn (ES) - ya redactado, revisar y programar
- [ ] Escribir thread de Twitter/X (EN):
  1. "Companies are deploying AI agents with zero onboarding infrastructure."
  2. "No permissions. No context. No audit trail. Just vibes."
  3. "You wouldn't hire a human without onboarding. Why deploy an agent without one?"
  4. "Building the fix -> ianding.es"
- [ ] Preparar post Reddit (EN) para r/artificial, r/MachineLearning, r/ClaudeAI
- [ ] Preparar post Indie Hackers (EN)

---

## Lunes 10 marzo (Dia 1 - Launch Day)

- [ ] Lanzar en Product Hunt (publicar antes de las 00:01 PST)
- [ ] Publicar thread en Twitter/X, mencionar @ProductHunt
- [ ] Activar Google Ads
- [ ] Compartir link de PH en LinkedIn, Twitter, WhatsApp a contactos cercanos
- [ ] Monitorizar PH durante el dia: responder comentarios
- [ ] Revisar GA4 Realtime al final del dia

## Martes 11 (Dia 2)

- [ ] Publicar post en LinkedIn (ES)
- [ ] Publicar en Reddit (r/artificial, r/ClaudeAI)
- [ ] Enviar DMs personalizados a 5-10 CTOs/ingenieros AI de tu red
- [ ] Revisar metricas GA4 + Clarity

## Miercoles 12 (Dia 3)

- [ ] Publicar en Reddit (r/MachineLearning, r/startups)
- [ ] Publicar en Indie Hackers
- [ ] Compartir en Discord/Slack de comunidades AI
- [ ] Revisar metricas + responder comentarios

## Jueves 13 - Domingo 16 (Dia 4-7)

- [ ] Segundo post en LinkedIn (update con datos de PH si fueron buenos)
- [ ] Responder todos los comentarios/DMs pendientes
- [ ] Enviar DMs a 5-10 contactos mas
- [ ] Revisar metricas diariamente
- [ ] Ajustar Google Ads si hay keywords que no funcionan

---

## Semana 2: Analisis (17-23 marzo)

- [ ] Exportar datos de GA4 (visitas, eventos, conversiones por fuente)
- [ ] Revisar heatmaps de Clarity (donde hacen scroll, donde dropean)
- [ ] Calcular metricas clave:
  - Tasa de conversion (emails / visitas) — objetivo >5%
  - Coste por lead (gasto ads / emails) — objetivo <5 EUR
  - Click rate CTA (clicks / visitas) — objetivo >10%
  - Bounce rate — objetivo <50%
  - Tiempo en pagina — objetivo >60s
- [ ] Compilar feedback cualitativo (Reddit, PH, LinkedIn, DMs)
- [ ] Escribir `docs/validation/results.md` con conclusiones
- [ ] Tomar decision: GO / PIVOT / KILL

### Criterios de decision

**GO** (construir MVP):
- Conversion >5% con >50 emails
- Feedback positivo ("cuando puedo probarlo?")
- Coste por lead <10 EUR
- 10-15 personas respondieron activamente

**PIVOT** (cambiar angulo):
- Conversion 2-5% pero buen engagement cualitativo
- Mensaje no conecta pero hay interes en el problema
- Objeciones repetidas que indican otro angulo

**KILL** (abandonar):
- Conversion <2% con >500 visitas
- Nadie responde ni pregunta
- Coste por lead >20 EUR

---

## URLs de referencia

| Canal | URL con UTM |
|-------|-------------|
| Product Hunt | `ianding.es?utm_source=producthunt&utm_medium=organic&utm_campaign=launch` |
| Google Ads | `ianding.es?utm_source=google&utm_medium=cpc&utm_campaign=validation` |
| Reddit | `ianding.es?utm_source=reddit&utm_medium=social&utm_campaign=validation` |
| LinkedIn | `ianding.es?utm_source=linkedin&utm_medium=social&utm_campaign=validation` |
| LinkedIn DMs | `ianding.es?utm_source=linkedin&utm_medium=social&utm_campaign=validation&utm_content=dm` |
| Twitter/X | `ianding.es?utm_source=twitter&utm_medium=social&utm_campaign=validation` |
| Indie Hackers | `ianding.es?utm_source=indiehackers&utm_medium=social&utm_campaign=validation` |
| Discord/Slack | `ianding.es?utm_source=discord&utm_medium=social&utm_campaign=validation` |

Ver detalle completo de UTMs en [utm-tracking.md](validation/utm-tracking.md).
