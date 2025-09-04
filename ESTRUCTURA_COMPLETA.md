# 📋 ESTRUCTURA COMPLETA DE LA WEB

## 🌐 Información de Despliegue
- **Dominio Principal**: https://organizacion-familiar-javi.onrender.com
- **Plataforma**: Render (migrado desde Railway)
- **Base de Datos**: PostgreSQL (Neon)
- **Archivo Principal**: `working.cjs`

## 🔗 URLs y Usuarios
- **Javier**: https://organizacion-familiar-javi.onrender.com/javier/abc123xyz789def456
- **Raquel**: https://organizacion-familiar-javi.onrender.com/raquel/uvw012rst345ghi678
- **Mario**: https://organizacion-familiar-javi.onrender.com/mario/jkl901mno234pqr567
- **Alba**: https://organizacion-familiar-javi.onrender.com/alba/stu890vwx123yzb456
- **Admin**: https://organizacion-familiar-javi.onrender.com/admin/cde789fgh012ijl345

## 🎨 Diseño y Layout

### Sidebar (256px fijo)
- **Header**: Icono 🏠 con gradiente verde-azul
- **Navegación**:
  - 📅 Actividades (activo por defecto)
  - 🍽️ Comidas
  - 👨🍳 Recetas
  - 📦 Inventario
  - 🛒 Lista de la compra
  - 💬 Mensajes
- **Footer**: Nombre del usuario + 👤

### Main Content
- **Top Bar**: "¡Hola, [Nombre]! 👋" (64px altura)
- **Content Area**: Padding 32px

## 📱 Secciones Detalladas

### 1. ACTIVIDADES
- **Título**: Gradiente verde-azul
- **Vista**: Botones "Vista Diaria" / "Vista Semanal"
- **Card**: "Actividades de Hoy"
- **Items**: Fondo azul claro, borde izquierdo azul, botón "Marcar/✓ Hecho"

### 2. COMIDAS
- **Título**: Gradiente amarillo-naranja
- **Navegación**: "← Semana Anterior" / "Semana del X al Y" / "Semana Siguiente →"
- **Tabla**:
  - Columnas: Vacía, Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo
  - Filas:
    - "Desayuno Alba y Mario"
    - "Desayuno Raquel y Javier"
    - "Comida"
    - "Cena"
- **Interacción**: Click en celda → "¿Marcar como hecho?" → Fondo verde + "✓ Hecho"

### 3. RECETAS
- **Título**: Gradiente rojo-naranja
- **Categorías**: Botones "Comidas" / "Cenas"
- **Grid**: Cards con nombre, ingredientes, tiempo, porciones
- **Datos iniciales**:
  - Lubina sobre cama de verduras (Lubina: 1, Ajo: 2, 0.5h, 4 porciones)
  - Salmón en papillote (Salmón fresco: 1, Ajo: 1, 0.75h, 4 porciones)

### 4. INVENTARIO
- **Título**: Gradiente morado-rosa
- **Grid**: Cards con nombre, cantidad + unidad, botones - y +
- **Datos iniciales**:
  - Jamón (carne, Carne internet, paquetes, 0)
  - Salmón fresco (pescado, Pescadería, unidades, 0)
  - Ajo (verdura, Del bancal a casa, unidades, 0)
  - Aceite oliva (otros, Alcampo, litros, 0)

### 5. LISTA DE LA COMPRA
- **Título**: Gradiente verde-azul
- **Organización por tiendas**:
  - Carne internet
  - Pescadería
  - Del bancal a casa
  - Alcampo
  - Internet
  - Otros
- **Lógica**:
  - Necesarios (cantidad = 0): Fondo rojo claro
  - Sugerencias (cantidad = 1): Fondo amarillo claro

### 6. MENSAJES
- **Título**: Gradiente morado-rosa
- **3 Cards**:

#### Card 1: "Esta semana quiero que hablemos de:"
- Mensajes con fondo azul claro
- Input + botón "Enviar"
- Formato: **usuario** (hora): texto

#### Card 2: "Sugerencias para el administrador"
- Mensajes con fondo amarillo claro
- Input + botón "Enviar"
- Formato: **usuario** (hora): texto

#### Card 3: "Mensaje privado a:"
- Select con opciones: Javier, Raquel, Mario, Alba
- Mensajes con fondo diferente según emisor
- Input + botón "Enviar"
- Formato: **usuario** (hora): texto

## 🎨 Colores y Estilos

### Gradientes de Títulos
- Actividades: `linear-gradient(to right, #10b981, #3b82f6)`
- Comidas: `linear-gradient(to right, #f59e0b, #d97706)`
- Recetas: `linear-gradient(to right, #dc2626, #ea580c)`
- Inventario: `linear-gradient(to right, #9333ea, #ec4899)`
- Lista compra: `linear-gradient(to right, #10b981, #3b82f6)`
- Mensajes: `linear-gradient(to right, #8b5cf6, #ec4899)`

### Botones y Estados
- Activo: `#10b981` (verde)
- Hover: `#059669` (verde oscuro)
- Sidebar activo: Verde con sombra
- Cards: Fondo blanco, border-radius 12px, sombra sutil

## 🔧 Funcionalidades JavaScript

### APIs Implementadas
- `POST /api/activity` - Crear actividad
- `POST /api/complete-activity` - Marcar actividad
- `POST /api/inventory` - Actualizar inventario
- `POST /api/recipe` - Crear receta
- `POST /api/meal-plan` - Planificar comida
- `POST /api/complete-meal` - Marcar comida hecha
- `POST /api/message` - Enviar mensaje
- `GET /api/data` - Obtener todos los datos
- `GET /health` - Endpoint de salud para monitoreo

### Actualizaciones
- Carga inicial: `loadData()`
- Auto-refresh: Cada 10 segundos
- Cambio de destinatario privado: Recarga mensajes

## 📦 Datos Iniciales

### Usuarios
```javascript
javier: { id: 'javier', name: 'Javier', password: 'password123' }
raquel: { id: 'raquel', name: 'Raquel', password: 'password456' }
mario: { id: 'mario', name: 'Mario', password: 'password789' }
alba: { id: 'alba', name: 'Alba', password: 'password000' }
javi_administrador: { id: 'javi_administrador', name: 'Javi (Admin)', password: 'admin123' }
```

### Inventario Inicial
- Jamón (carne, Carne internet, paquetes)
- Salmón fresco (pescado, Pescadería, unidades)
- Ajo (verdura, Del bancal a casa, unidades)
- Aceite oliva (otros, Alcampo, litros)

### Recetas Iniciales
- Lubina sobre cama de verduras
- Salmón en papillote

## 🛡️ Sistema de Protección y Backup

### Archivos de Backup
- `backup-system.sh` - Backup completo automático
- `deploy-safe.sh` - Despliegue con verificaciones
- `health-check.js` - Monitoreo de salud de la app
- Carpeta `backups/` con respaldos automáticos

### Reglas de Desarrollo
- NUNCA tocar `working.cjs` si funciona en producción
- Siempre hacer backup antes de cambios: `git add . && git commit -m "Backup antes de cambios"`
- Usar ramas separadas para nuevas funcionalidades
- Rollback inmediato si algo se rompe

### Comandos de Emergencia
```bash
# Verificar salud
node health-check.js

# Backup completo
./backup-system.sh

# Despliegue seguro
./deploy-safe.sh

# Rollback rápido
git log --oneline -10
git checkout <ultimo_commit_funcionando>
git push origin main --force
```

## 🔧 Arquitectura Técnica

### Archivos Principales
- `working.cjs` - Servidor principal en producción
- `package.json` - Dependencias y scripts
- `vercel.json` - Configuración de despliegue
- `.env` - Variables de entorno

### Estructura de Carpetas
- `api/` - Endpoints adicionales
- `public/` - Archivos estáticos
- `src/` - Código fuente React/TypeScript
- `server/` - Lógica del servidor
- `backups/` - Respaldos automáticos
- `.amazonq/rules/` - Reglas de desarrollo

Esta documentación permite recrear exactamente la web tal como está funcionando ahora.