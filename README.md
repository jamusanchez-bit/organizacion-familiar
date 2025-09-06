# 🏠 Organización Familiar

Sistema completo de organización familiar con mensajes, actividades, inventario y más.

## 🔗 Enlaces de Acceso

- **Javier**: https://organizacion-familiar-production-e98c.up.railway.app/javier/abc123xyz789def456
- **Raquel**: https://organizacion-familiar-production-e98c.up.railway.app/raquel/uvw012rst345ghi678
- **Mario**: https://organizacion-familiar-production-e98c.up.railway.app/mario/jkl901mno234pqr567
- **Alba**: https://organizacion-familiar-production-e98c.up.railway.app/alba/stu890vwx123yzb456
- **Administrador**: https://organizacion-familiar-production-e98c.up.railway.app/admin/cde789fgh012ijl345

## 🛠️ Comandos de Mantenimiento

### Backup Completo
```bash
./backup-system.sh
```

### Despliegue Seguro
```bash
./deploy-safe.sh
```

### Verificar Salud de la App
```bash
node health-check.js
```

## 🔧 Tecnologías

- **Frontend**: HTML/CSS/JavaScript vanilla
- **Backend**: Node.js
- **Base de Datos**: PostgreSQL (Neon)
- **Hosting**: Railway
- **Dominio**: organizacion-familiar-production.up.railway.app

## 📝 ESTADO ACTUAL DEL PROYECTO (CRÍTICO - NO BORRAR)

### Plataforma de Despliegue: RAILWAY
- URL: https://organizacion-familiar-production-e98c.up.railway.app
- Archivo principal: `working.cjs`
- Render eliminado completamente - SOLO RAILWAY

### Últimos Cambios Realizados:
- ✅ Migración completa a Railway
- ✅ Eliminación de todos los proyectos de Render
- ✅ Botón de inglés arreglado (cambio de window.open a window.location.href)
- 🔄 PENDIENTE: Verificar despliegue del botón de inglés en Railway

## 🛡️ Sistema de Protección

- ✅ Backups automáticos de código y BD
- ✅ Dominio fijo (enlaces nunca cambian)
- ✅ Rollback rápido en Vercel
- ✅ Monitoreo de salud
- ✅ Despliegue con verificaciones

## 📱 Funcionalidades

- **Mensajes**: Chat grupal y privado en tiempo real
- **Actividades**: Sistema de retos y rachas
- **Inventario**: Control de stock con botones +/-
- **Comidas**: Planificación semanal
- **Compras**: Lista automática
- **Recetas**: Gestión de recetas
- **Ca'mon**: Sección de aprendizaje de inglés integrada

## 🚨 En Caso de Problemas

1. **App no funciona**: `node health-check.js`
2. **Rollback**: Railway Dashboard → Deployments → deployment anterior → "Redeploy"
3. **Restaurar BD**: Usar archivo `backups/db_backup_*.sql`
4. **Restaurar código**: `git log` y `git checkout <commit>`
5. **Forzar redeploy**: Railway Dashboard → "Deploy Now"

## 📞 Soporte

Los enlaces son permanentes y la app está respaldada automáticamente.