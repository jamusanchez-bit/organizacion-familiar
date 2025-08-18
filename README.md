# organizacion-familiar

Breve descripción del proyecto.

## Objetivo
Desarrollar localmente con VSCode, mantener el código en GitHub y desplegar en Render utilizando Neon (Postgres).

## Requisitos
- Node.js 18+ (recomendado 18.x o 20.x)
- npm (o pnpm/yarn si tu repo lo usa)
- VSCode

## Instalación local
1. Clona el repo:
   git clone git@github.com:jamusanchez-bit/organizacion-familiar.git
2. En la raíz del proyecto:
   npm ci
3. Copia `.env.example` a `.env` y rellena las variables:
   - DATABASE_URL (Neon)
   - JWT_SECRET (si aplica)
4. Ejecuta en desarrollo:
   npm run dev

## Scripts útiles
- npm run dev — arranca en modo desarrollo
- npm run build — build para producción
- npm start — start del servidor

## Despliegue en Render
1. Conecta tu repo de GitHub en Render.
2. Crea un Web Service:
   - Build command: npm ci && npm run build
   - Start command: npm start
   - Environment: Node 18.x
3. Añade las environment variables en Render:
   - DATABASE_URL (cadena Neon)
   - NODE_ENV=production
   - JWT_SECRET (si aplica)
4. Despliega y revisa logs.

## Neon (Postgres)
- Crea la base de datos en Neon y copia la URL de conexión.
- Si existen migraciones, ejecútalas contra la DB (local o en Render según sea necesario).

## VSCode
Recomendadas:
- ESLint
- Prettier
- Node Debug
- Tailwind CSS IntelliSense (si aplica)

## Notas
- Se eliminarán los archivos específicos de Replit (.replit, replit.nix).
- Si el repo contiene scripts o configuraciones particulares, adaptaré los comandos en package.json.