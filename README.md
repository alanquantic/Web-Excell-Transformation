# Eagle OTR Ops Suite

Aplicación web para la gestión de operaciones de reciclaje de neumáticos OTR de
**Eagle International**: calculadora de repuestos, simulaciones de producción y
costos, auditoría de desgaste de cuchillas y gestión de proyectos por sitio.

Migración del calculador original de Excel (`OTR Recommended Spare Parts.xlsx`) a
una aplicación **Next.js 14** lista para desplegar en **Vercel**.

> El análisis original del Excel, los reportes técnicos y los insumos del cliente
> (PDFs, presentación, prototipo Vite) están archivados en [`docs/`](./docs).

---

## 🧱 Stack

| Capa            | Tecnología                                        |
| --------------- | ------------------------------------------------- |
| Framework       | Next.js 14 (App Router) + React 18 + TypeScript   |
| Estilos         | Tailwind CSS + shadcn/ui (Radix)                  |
| Base de datos   | PostgreSQL + Prisma ORM                           |
| Autenticación   | NextAuth (Credentials + JWT, bcrypt)              |
| Gráficas        | Recharts                                          |
| Deploy          | Vercel                                            |

---

## 📁 Estructura

```
.
├── app/                 # Rutas (App Router): páginas + API routes
│   ├── api/             # Endpoints (auth, parts, scenarios, production, ...)
│   ├── actions/         # Server actions (proyectos)
│   ├── calculator/      # Calculadora de repuestos + producción
│   ├── dashboard/       # Gestión de proyectos por sitio
│   ├── audit/           # Dashboard de auditoría de cuchillas
│   └── history/         # Historial de cálculos
├── components/          # Componentes de UI y de features
│   └── ui/              # Primitivos shadcn/ui
├── lib/                 # Lógica de negocio, cálculos, cliente Prisma, auth
├── prisma/              # schema.prisma (modelo de datos)
├── scripts/             # seed.ts (datos de ejemplo)
├── public/              # Estáticos (favicon, og-image, troubleshooting_db.json)
└── docs/                # Análisis del Excel, arquitectura e insumos originales
```

---

## 🚀 Puesta en marcha (local)

### Requisitos
- Node.js 18.18+ (recomendado 20 LTS)
- Una base de datos PostgreSQL (local, o gestionada: Neon / Vercel Postgres / Supabase)

### Pasos

```bash
# 1. Instalar dependencias (genera el cliente de Prisma en postinstall)
npm install

# 2. Configurar variables de entorno
cp .env.example .env
#   Edita .env y coloca tu DATABASE_URL, NEXTAUTH_SECRET y NEXTAUTH_URL

# 3. Crear el esquema en la base de datos
npm run db:push

# 4. (Opcional) Sembrar datos de ejemplo (usuario demo + catálogo de partes)
npm run db:seed

# 5. Arrancar en desarrollo
npm run dev
```

La app queda en **http://localhost:3000**.

Usuario demo tras el seed: `john@doe.com` / `johndoe123`.

---

## 🔐 Variables de entorno

| Variable          | Descripción                                                              |
| ----------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL`    | Conexión **pooled** (runtime). Neon: host `-pooler` + `pgbouncer=true`.   |
| `DIRECT_URL`      | Conexión **directa** (migraciones / `db push`). Neon: host sin `-pooler`. |
| `NEXTAUTH_SECRET` | Secreto de sesión. Genera con `openssl rand -base64 32`.                  |
| `NEXTAUTH_URL`    | URL canónica del despliegue. Local: `http://localhost:3000`.             |

> ⚠️ **Nunca** subas el archivo `.env` al repositorio. Ya está en `.gitignore`.
> Usa `.env.example` como plantilla.

---

## ☁️ Despliegue en Vercel

1. Importa el repositorio en Vercel. Detecta Next.js automáticamente (Root
   Directory = `/`, no requiere configuración especial).
2. En **Settings → Environment Variables** añade `DATABASE_URL`,
   `NEXTAUTH_SECRET` y `NEXTAUTH_URL` (esta última con la URL de producción,
   p. ej. `https://tu-app.vercel.app`).
3. Antes del primer deploy, sincroniza el esquema contra la base de datos de
   producción (una sola vez), desde tu máquina apuntando a la `DATABASE_URL` de
   producción:
   ```bash
   npm run db:push
   npm run db:seed   # opcional
   ```
4. Deploy. El `build` ejecuta `prisma generate && next build`; el `postinstall`
   regenera el cliente de Prisma en cada instalación.

---

## 📜 Scripts

| Script            | Acción                                            |
| ----------------- | ------------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo                            |
| `npm run build`   | `prisma generate` + build de producción           |
| `npm run start`   | Sirve el build de producción                      |
| `npm run lint`    | Linter de Next.js                                 |
| `npm run db:push` | Sincroniza `schema.prisma` con la base de datos   |
| `npm run db:seed` | Siembra datos de ejemplo                          |
