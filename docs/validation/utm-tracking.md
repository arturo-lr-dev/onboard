# UTM Tracking Reference

## URLs por Canal

### Product Hunt
```
https://ianding.es?utm_source=producthunt&utm_medium=organic&utm_campaign=launch
```

### Google Ads
```
https://ianding.es?utm_source=google&utm_medium=cpc&utm_campaign=validation
```

### Reddit
```
https://ianding.es?utm_source=reddit&utm_medium=social&utm_campaign=validation
```

### LinkedIn (post orgánico)
```
https://ianding.es?utm_source=linkedin&utm_medium=social&utm_campaign=validation
```

### LinkedIn (DMs directos)
```
https://ianding.es?utm_source=linkedin&utm_medium=social&utm_campaign=validation&utm_content=dm
```

### Twitter/X (thread)
```
https://ianding.es?utm_source=twitter&utm_medium=social&utm_campaign=validation
```

### Indie Hackers
```
https://ianding.es?utm_source=indiehackers&utm_medium=social&utm_campaign=validation
```

### Discord / Slack communities
```
https://ianding.es?utm_source=discord&utm_medium=social&utm_campaign=validation
https://ianding.es?utm_source=slack&utm_medium=social&utm_campaign=validation
```

---

## Parámetros UTM Usados

| Parámetro      | Valores posibles                                                  |
|----------------|-------------------------------------------------------------------|
| `utm_source`   | producthunt, google, reddit, linkedin, twitter, indiehackers, discord, slack |
| `utm_medium`   | organic, cpc, social                                              |
| `utm_campaign` | launch (Product Hunt), validation (resto)                         |
| `utm_content`  | dm (para DMs directos)                                            |

---

## Implementación técnica

- Los UTMs se persisten en `sessionStorage` al cargar la página (`Layout.astro`)
- Se adjuntan automáticamente a los eventos GA4: `cta_click`, `email_submit`, y section views
- GA4 Property ID: `G-4WZ2L1ZNMN`
- Microsoft Clarity Project: `vryvc4518o`

---

## Verificación

1. Visitar la landing con un UTM de prueba: `https://ianding.es?utm_source=test&utm_medium=test&utm_campaign=test`
2. Abrir DevTools > Application > Session Storage: confirmar que se guardan los UTMs
3. Hacer click en un CTA y verificar en GA4 Realtime > Events que aparece `cta_click` con los parámetros
4. Enviar el formulario y verificar `email_submit` en GA4
