# Seguridad — RutaMx Frontend

Documentación de las correcciones de ciberseguridad aplicadas al frontend, principalmente derivadas de análisis con OWASP ZAP.

---

## 1. Hallazgos de ZAP y sus correcciones (sesión 2026-06-09)

### 1.1 Falta de Content Security Policy (CSP)

**Alerta ZAP:** "Content Security Policy (CSP) Header Not Set" — el sitio no declaraba fuentes de contenido aprobadas, dejando abierta la puerta a XSS e inyección de datos.

**Corrección:** se agregó el encabezado `Content-Security-Policy` en `next.config.ts` (función `headers()`, aplica a todas las rutas, incluidas 404 como `/robots.txt`). Política:

| Directiva | Valor | Razón |
|---|---|---|
| `default-src` | `'self'` | Solo contenido propio por defecto |
| `script-src` | `'self' 'unsafe-inline'` (+ `'unsafe-eval'` **solo en dev**) | React dev necesita `eval`; en producción no se incluye |
| `style-src` | `'self' 'unsafe-inline'` | Tailwind/estilos inline |
| `img-src` | `'self' blob: data: https://api.dicebear.com` | Avatares dicebear + mapas |
| `connect-src` | `'self'` + API backend + Firebase Auth + Mapbox | XHR/fetch permitidos: `identitytoolkit.googleapis.com`, `securetoken.googleapis.com`, `api.mapbox.com`, `events.mapbox.com`, `*.tiles.mapbox.com` |
| `worker-src` | `'self' blob:` | mapbox-gl usa web workers desde blob |
| `object-src` | `'none'` | Sin plugins embebidos |
| `base-uri` | `'self'` | Previene inyección de `<base>` |
| `form-action` | `'self'` | Formularios solo al propio origen |
| `frame-ancestors` | `'none'` | Nadie puede embeber el sitio en iframe |
| `upgrade-insecure-requests` | — | Fuerza HTTPS en producción |

### 1.2 Clickjacking (falta de frame-ancestors / X-Frame-Options)

**Alerta ZAP:** "Missing Anti-clickjacking Header" en `/` y `/login`.

**Corrección:** doble protección en `next.config.ts`:
- `frame-ancestors 'none'` dentro del CSP (navegadores modernos)
- `X-Frame-Options: DENY` (navegadores antiguos y escáneres que lo verifican por separado)

### 1.3 script-src incluye 'unsafe-eval'

**Alerta ZAP:** el CSP permitía `unsafe-eval`.

**Causa:** el escaneo se hizo contra el servidor de **desarrollo** (`next dev`). React en modo dev usa `eval` para reconstruir stack traces. La config solo agrega `'unsafe-eval'` cuando `NODE_ENV=development`.

**Corrección/verificación:** en build de producción (`next build && next start`) el encabezado **no** incluye `unsafe-eval` (verificado con `curl`). **Los escaneos de ZAP deben hacerse contra el build de producción**, no contra `next dev`.

### 1.4 Encabezados adicionales agregados

- `X-Content-Type-Options: nosniff` — evita MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` — limita fuga de URL en el header Referer

### 1.5 Falso positivo: alertas en localhost:8080

Las alertas sobre `http://localhost:8080/UI/...` (`/UI/spider/`, `/UI/ascan/`, etc.) **no son del frontend**: son la interfaz interna de la API de ZAP en su puerto proxy. ZAP se escaneó a sí mismo. Para escanear la app: apuntar a `http://localhost:3000` (dev) o al puerto del build de producción.

---

## 2. Correcciones de seguridad de sesiones anteriores (git history)

| Commit | Fix |
|---|---|
| `f3c6645` feat(HU26) | Autenticación con Firebase Auth REST; `NEXT_PUBLIC_FIREBASE_API_KEY` movida a variable de entorno (nunca hardcodeada); cliente API con header `Authorization` y redirect en 401 |
| `9808116` fix(auth) | `AuthGuard` en layouts de admin y principal — protege rutas contra acceso sin sesión |
| PR #26/#27 `security-role-url-validation` | Validación del rol en la URL contra el rol almacenado; redirect a login si el rol no se puede determinar (evita acceso a dashboards de otro rol cambiando la URL) |
| `8eb7129` fix(auth) | Refresh de token en 401 en lugar de sesión rota |
| `a8010df` fix(security) | Se removió la ruta interna del API de un `console.warn` (no exponer rutas internas); política de contraseñas completa (10 chars) aplicada en el handler, no solo en la UI |
| `96b5d2a` feat(auth) | Cambio de contraseña requiere verificar la contraseña actual (re-autenticación con Firebase) antes de actualizar |
| `7e1a6ce` feat(auth) | Validación de fortaleza de contraseña en tiempo real |
| `71e161f` feat(admin) | Reset de contraseña por admin como acción explícita |
| `f031364` fix(users) | Normalización de email a minúsculas en creación y login (evita cuentas duplicadas) |

---

## 3. Cómo verificar

```bash
# Build y servidor de producción
npm run build
npx next start -p 3001

# Verificar encabezados
curl -sI http://localhost:3001/login | grep -i "content-security\|x-frame\|x-content\|referrer"
```

Debe responder con `Content-Security-Policy` (sin `unsafe-eval`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` y `Referrer-Policy`.

Escanear con ZAP contra el puerto del build de producción.

---

## 4. Pendientes conocidos / decisiones

- **`'unsafe-inline'` en `script-src`:** ZAP puede reportarlo como advertencia baja. Quitarlo requiere CSP con nonces vía proxy, lo que fuerza renderizado dinámico en todas las páginas (se pierde el render estático). Decisión: no vale el costo para este proyecto.
- **`/robots.txt` y `/sitemap.xml`:** devuelven 404 (no existen). No es problema de seguridad; agregar solo si se necesita SEO.
- Si se agrega un origen externo nuevo (CDN, API), hay que añadirlo a `connect-src`/`img-src` en `next.config.ts` o el navegador lo bloqueará.
