# Onboard - Plan de Validación

**Objetivo:** Validar si hay demanda real para una plataforma de onboarding empresarial de agentes IA antes de construir el producto completo.

**Timeline:** 14 días
**Presupuesto:** 100-200€ en ads
**Criterio de éxito:** >5% conversión y >50 emails recopilados

---

## Estado Actual

✅ **Fase 1: Idea cristalizada**
- Problema: Empresas despliegan agentes IA sin estructura — sin contexto, sin permisos, sin trazabilidad
- Target: CTOs, ingenieros AI/ML, responsables de seguridad en empresas que despliegan agentes IA
- Propuesta: Plataforma de onboarding empresarial para agentes IA (contexto, acceso, cumplimiento)
- Modelo: SaaS por agente (~$49-199/agente/mes)

✅ **Fase 2: Investigación de mercado**
- No hay competidor directo — el gap está entre frameworks de agentes (LangChain, CrewAI) y herramientas de identidad (Okta, Auth0)
- Hueco: Capa de infraestructura para hacer agentes IA production-ready
- Mercado validado: Empresas ya despliegan agentes pero sin proceso estandarizado

✅ **Fase 3: Landing creada**
- **Dominio:** https://ianding.es/
- Stack: Astro + Tailwind
- Formspree: Configurado para captura de emails

---

## Próximos Pasos (Fase 4-7)

### Fase 4: Configurar Tracking (1-2 horas) ✅ COMPLETADO

**Objetivos:**
- Instalar Google Analytics 4 (o Plausible si prefieres privacidad)
- Configurar eventos de conversión
- Añadir Microsoft Clarity para heatmaps
- Verificar que Formspree capture emails correctamente

**Tareas:**
1. [x] Crear cuenta Google Analytics 4 para Onboard (G-4WZ2L1ZNMN)
2. [x] Añadir tracking code en `src/layouts/Layout.astro`
3. [x] Configurar eventos personalizados:
   - `page_view` (automático con GA4)
   - `cta_click` (clicks en cualquier CTA hacia #contact)
   - `email_submit` (formulario completado en ContactForm)
   - `contact_view` / `problem_view` / `solution_view` / `who_view` (scroll con IntersectionObserver)
4. [x] Instalar Microsoft Clarity (proyecto vryvc4518o)
5. [x] Configurar UTM parameters — persistencia automática en sessionStorage:
   - `?utm_source=producthunt&utm_medium=organic&utm_campaign=launch`
   - `?utm_source=google&utm_medium=cpc&utm_campaign=validation`
   - `?utm_source=reddit&utm_medium=social&utm_campaign=validation`
6. [ ] Test de tracking: visita con diferentes UTMs, verificar en GA4
7. [ ] Marcar `email_submit` y `cta_click` como conversiones en GA4 Admin → Events

**Entregables:**
- ✅ Dashboard de GA4 configurado
- ✅ Eventos de conversión activos (pendiente marcarlos como conversiones en GA4)
- ✅ UTM tracking funcionando

---

### Fase 5: Conectar ianding.es y Generar Tráfico (Día 1-7) 🔄 SIGUIENTE

#### A. Configurar Dominio (30 min)

**Tareas:**
1. [x] Ir a Vercel dashboard del proyecto Onboard
2. [x] Settings → Domains → Add ianding.es
3. [x] Copiar registros DNS (A/CNAME) que Vercel indique
4. [x] Configurar DNS en el panel del registrador de ianding.es
5. [x] Esperar propagación (15-60 min)
6. [x] Verificar que HTTPS funcione automáticamente
7. [ ] Actualizar todos los links/menciones a la landing con el nuevo dominio

#### B. Plan de Tráfico (100-200€, 7 días)

**Estrategia Multi-Canal:**

**1. Product Hunt (Lunes 10 marzo) — GRATIS, alta calidad**
- [x] Crear producto en Product Hunt (nombre: Onboard)
- [x] Tagline: "Enterprise-Grade Onboarding for AI Agents"
- [x] Descripción completa (problema + solución + CTA)
- [x] Gallery: 5 screenshots de la landing (EN)
- [x] Shoutouts y tags configurados
- [x] Programar launch para lunes 10 de marzo
- [ ] Preparar maker comment para el día del launch
- [ ] Pedir a 3-5 contactos que hagan upvote temprano (momentum)
- **Tráfico esperado:** 200-500 visitas

**2. Google Ads (Día 1-7) — 50-100€**
- [ ] Crear campaña de búsqueda
- Keywords de intención alta:
  - "ai agent deployment"
  - "ai agent management platform"
  - "deploy ai agents enterprise"
  - "ai agent governance"
  - "ai agent onboarding"
- Presupuesto: 10-15€/día durante 7 días
- Copy de anuncios:
  - Headline: "AI Agent Onboarding Platform | Enterprise-Ready"
  - Description: "Deploy agents with context, access & compliance. From $49/agent/mo."
- Landing page: ianding.es?utm_source=google&utm_medium=cpc&utm_campaign=validation
- **Tráfico esperado:** 150-300 visitas

**3. Reddit (Día 2-3) — GRATIS**
- [ ] Post en subreddits relevantes:
  - r/artificial: "How are you managing AI agent deployments at scale?"
  - r/MachineLearning: "Building an onboarding layer for AI agents — feedback?"
  - r/startups: "Validating: enterprise onboarding infrastructure for AI agents"
  - r/ClaudeAI, r/ChatGPTCoding: "Agent governance is a mess — building a fix"
- [ ] Ser honesto: "Estoy validando esta idea, ¿os interesaría?"
- [ ] Responder todos los comentarios genuinamente
- **Tráfico esperado:** 50-150 visitas

**4. LinkedIn (Día 2-4) — GRATIS**
- [ ] Post personal en LinkedIn:
  - Hook: "Desplegamos agentes IA como si fuera el salvaje oeste."
  - Story: Sin permisos, sin contexto, sin trazabilidad — por qué estás construyendo Onboard
  - CTA: "Validando la idea con acceso anticipado gratuito → ianding.es"
- [ ] Compartir en grupos relevantes de AI/enterprise/startups
- [ ] Enviar DMs personalizados a 10-15 CTOs/ingenieros AI de tu red
- **Tráfico esperado:** 50-100 visitas

**5. Twitter/X (Día 1-7) — GRATIS**
- [ ] Thread sobre el problema:
  1. "Companies are deploying AI agents with zero onboarding infrastructure."
  2. "No permissions. No context. No audit trail. Just vibes."
  3. "You wouldn't hire a human without onboarding. Why deploy an agent without one?"
  4. "Building the fix → ianding.es"
- [ ] Mencionar @ProductHunt cuando lances ahí
- [ ] Retwittear con updates de validación (transparencia)
- **Tráfico esperado:** 30-80 visitas

**6. Comunidades de Indie Hackers (Día 3-5) — GRATIS**
- [ ] Post en Indie Hackers: "Validating: Enterprise onboarding infrastructure for AI agents"
- [ ] Compartir en Discord/Slack de AI/founders (AI communities, MicroConf)
- **Tráfico esperado:** 20-50 visitas

**Tráfico total esperado: 500-1,000+ visitas**

---

### Fase 6: Medir y Analizar (Día 8-14)

**Esperar a tener mínimo 500 visitas antes de sacar conclusiones.**

**Métricas clave:**

| Métrica | Cómo medirla | Bueno | Regular | Malo |
|---------|--------------|-------|---------|------|
| **Tasa de conversión** | Emails / Visitas | >5% | 2-5% | <2% |
| **Coste por lead** | Gasto ads / Emails | <5€ | 5-15€ | >15€ |
| **Click rate CTA** | Clicks CTA / Visitas | >10% | 5-10% | <5% |
| **Bounce rate** | Salidas inmediatas | <50% | 50-70% | >70% |
| **Tiempo en página** | Media duración | >60s | 30-60s | <30s |

**Tareas:**
1. [ ] Exportar datos de GA4 después de 7 días
2. [ ] Calcular métricas arriba
3. [ ] Revisar heatmaps de Clarity: ¿dónde hacen scroll? ¿dónde dropean?
4. [ ] Leer feedback cualitativo:
   - Respuestas a posts en Reddit/IH
   - DMs en LinkedIn/Twitter
   - Comentarios en Product Hunt
5. [ ] Documentar learnings en `VALIDATION-RESULTS.md`

---

### Fase 7: Decisión — Go / Pivot / Kill

**GO (construir MVP)** si:
- ✅ Conversión >5% con >50 emails
- ✅ Feedback cualitativo positivo ("¿cuándo lo puedo probar?")
- ✅ Coste por lead sostenible (<10€)
- ✅ Al menos 10-15 personas respondieron activamente

**Siguiente paso si GO:**
1. Enviar email a los 50+ leads: "Gracias por el interés. ¿Puedo hacerte 3 preguntas rápidas?"
2. Hacer 10-15 entrevistas de 15 min (validar willingness-to-pay)
3. Construir MVP ultra-mínimo: onboarding de 1 agente con contexto + permisos
4. Invitar a los 10 más engaged a beta privada
5. Cobrar desde día 1 (aunque sea $10/mes — valida WTP)

**PIVOT (cambiar enfoque)** si:
- ⚠️ Conversión 2-5% pero buen engagement cualitativo
- ⚠️ La gente llega pero el mensaje no conecta
- ⚠️ Feedback tipo "me gusta pero [objeción repetida]"

**Siguiente paso si PIVOT:**
1. Analizar objeciones comunes
2. Reformular value prop en la landing
3. Probar otro ángulo (ej: "agent governance" en vez de "agent onboarding")
4. Volver a Fase 5 con nueva landing

**KILL (abandonar)** si:
- ❌ Conversión <2% con >500 visitas
- ❌ Nadie responde, nadie pregunta
- ❌ Feedback tipo "ya uso X y funciona bien"
- ❌ Coste por lead >20€

**Siguiente paso si KILL:**
1. Documentar por qué falló (timing, producto, mercado, ejecución)
2. Agradecer a los pocos que se registraron
3. Guardar learnings en `MEMORY.md`
4. Siguiente idea 🚀

---

## Checklist Rápido

### Pre-Launch (Día 0)
- [x] Configurar GA4 + eventos (G-4WZ2L1ZNMN)
- [x] Instalar Microsoft Clarity (vryvc4518o)
- [x] Configurar UTM parameters (persistencia en sessionStorage)
- [x] Conectar ianding.es a Vercel
- [ ] Verificar que Formspree funciona
- [x] Product Hunt configurado (nombre, tagline, descripcion, gallery, shoutouts, tags)
- [ ] Preparar Google Ads (keywords: ai agent deployment/governance)

### Launch Week (Día 1-7)
- [ ] Lanzar Product Hunt (Día 1)
- [ ] Activar Google Ads (Día 1)
- [ ] Postear en Reddit (Día 2-3)
- [ ] Postear en LinkedIn (Día 2-4)
- [ ] Thread en Twitter (Día 1)
- [ ] Compartir en comunidades indie (Día 3-5)
- [ ] Revisar métricas diariamente
- [ ] Responder todos los comentarios/DMs

### Analysis Week (Día 8-14)
- [ ] Exportar todos los datos
- [ ] Calcular métricas
- [ ] Revisar heatmaps
- [ ] Compilar feedback cualitativo
- [ ] Decidir: GO / PIVOT / KILL
- [ ] Documentar resultados

---

## Notas Importantes

**🎯 Objetivo principal:** Validar demanda, NO conseguir usuarios. Los emails son solo una proxy de interés real.

**💬 Conversaciones > Números:** 10 conversaciones de calidad valen más que 100 emails fantasma.

**🚫 Red flags:**
- Emails tipo "test@test.com" o "info@empresa.com"
- Nadie responde cuando les escribes
- Conversión alta pero cero engagement cualitativo

**✅ Señales positivas:**
- Gente pregunta "¿cuándo estará disponible?"
- Alguien te pregunta el precio sin que lo menciones
- Te escriben "tengo este problema exacto"
- Alguien comparte tu landing en sus redes

---

**Launch programado: lunes 10 de marzo en Product Hunt.**
