# Onboard - Plan de Validación

**Objetivo:** Validar si hay demanda real para una plataforma de onboarding de productos SaaS antes de construir el producto completo.

**Timeline:** 14 días
**Presupuesto:** 100-200€ en ads
**Criterio de éxito:** >5% conversión y >50 emails recopilados

---

## Estado Actual

✅ **Fase 1: Idea cristalizada**
- Problema: Equipos SaaS pierden usuarios en los primeros días por onboarding deficiente
- Target: Fundadores/PMs de startups SaaS early-stage (5-50 usuarios/día)
- Propuesta: Plataforma de onboarding interactivo sin código
- Modelo: SaaS mensual (~$49-99/mes)

✅ **Fase 2: Investigación de mercado**
- Competidores: Appcues, Userflow, Chameleon (caros, >$200/mes)
- Hueco: Solución más simple y barata para early-stage
- Mercado validado: Existe demanda (competidores exitosos)

✅ **Fase 3: Landing creada**
- URL temporal: https://landing-rho-azure-47.vercel.app
- **Nuevo dominio:** ianding.es (pendiente conectar)
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
1. [ ] Ir a Vercel dashboard del proyecto Onboard
2. [ ] Settings → Domains → Add ianding.es
3. [ ] Copiar registros DNS (A/CNAME) que Vercel indique
4. [ ] Configurar DNS en el panel del registrador de ianding.es
5. [ ] Esperar propagación (15-60 min)
6. [ ] Verificar que HTTPS funcione automáticamente
7. [ ] Actualizar todos los links/menciones a la landing con el nuevo dominio

#### B. Plan de Tráfico (100-200€, 7 días)

**Estrategia Multi-Canal:**

**1. Product Hunt (Día 1) — GRATIS, alta calidad**
- [ ] Crear "upcoming" en Product Hunt
- [ ] Preparar copy para el launch:
  - Tagline: "Simple onboarding for early-stage SaaS"
  - Descripción: Problema + solución + CTA
  - Maker comment: Historia honesta de validación
- [ ] Programar launch para un martes/miércoles (mejores días)
- [ ] Pedir a 3-5 contactos que hagan upvote temprano (momentum)
- **Tráfico esperado:** 200-500 visitas

**2. Google Ads (Día 1-7) — 50-100€**
- [ ] Crear campaña de búsqueda
- Keywords de intención alta:
  - "user onboarding tool"
  - "saas onboarding software"
  - "appcues alternative"
  - "userflow alternative"
  - "onboarding platform for startups"
- Presupuesto: 10-15€/día durante 7 días
- Copy de anuncios:
  - Headline: "Simple Onboarding for Early SaaS | Try Free"
  - Description: "No-code onboarding flows. From $49/mo. Built for founders."
- Landing page: ianding.es?utm_source=google&utm_medium=cpc&utm_campaign=validation
- **Tráfico esperado:** 150-300 visitas

**3. Reddit (Día 2-3) — GRATIS**
- [ ] Post en subreddits relevantes:
  - r/SaaS: "I'm building a simpler onboarding tool for early-stage SaaS. What do you think?"
  - r/startups: "Validating an idea: affordable onboarding platform. Feedback?"
  - r/Entrepreneur: Post sobre el problema + solución
- [ ] Ser honesto: "Estoy validando esta idea, ¿os interesaría?"
- [ ] Responder todos los comentarios genuinamente
- **Tráfico esperado:** 50-150 visitas

**4. LinkedIn (Día 2-4) — GRATIS**
- [ ] Post personal en LinkedIn:
  - Hook: "Most SaaS products lose 70% of users in the first week."
  - Story: Por qué estás construyendo esto
  - CTA: "I'm validating this idea → ianding.es"
- [ ] Compartir en grupos relevantes de SaaS/startups
- [ ] Enviar DMs personalizados a 10-15 fundadores SaaS de tu red
- **Tráfico esperado:** 50-100 visitas

**5. Twitter/X (Día 1-7) — GRATIS**
- [ ] Thread sobre el problema:
  1. "70% of SaaS users churn in the first week"
  2. "Why? Poor onboarding."
  3. "Existing tools cost $200+/mo"
  4. "I'm building something simpler: ianding.es"
- [ ] Mencionar @ProductHunt cuando lances ahí
- [ ] Retwittear con updates de validación (transparencia)
- **Tráfico esperado:** 30-80 visitas

**6. Comunidades de Indie Hackers (Día 3-5) — GRATIS**
- [ ] Post en Indie Hackers: "Validating: Affordable onboarding for SaaS"
- [ ] Compartir en Discord/Slack de founders (MicroConf, SaaS communities)
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
3. Construir MVP ultra-mínimo: 1 flujo de onboarding básico
4. Invitar a los 10 más engaged a beta privada
5. Cobrar desde día 1 (aunque sea $10/mes — valida WTP)

**PIVOT (cambiar enfoque)** si:
- ⚠️ Conversión 2-5% pero buen engagement cualitativo
- ⚠️ La gente llega pero el mensaje no conecta
- ⚠️ Feedback tipo "me gusta pero [objeción repetida]"

**Siguiente paso si PIVOT:**
1. Analizar objeciones comunes
2. Reformular value prop en la landing
3. Probar otro ángulo (ej: "onboarding emails" en vez de "onboarding flows")
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
- [ ] Conectar ianding.es a Vercel
- [ ] Verificar que Formspree funciona
- [ ] Preparar copy para Product Hunt
- [ ] Preparar ads de Google

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

**Empezamos con Fase 4 (tracking) → 1-2 horas de trabajo.**

¿Listo para configurar GA4 y Clarity? 🚀
