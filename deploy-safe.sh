#!/bin/bash

# Sistema de despliegue seguro
echo "🚀 Iniciando despliegue seguro..."

# 1. Backup antes del despliegue
echo "🔄 Creando backup de seguridad..."
./backup-system.sh

# 2. Verificar que el código funciona localmente
echo "🔍 Verificando sintaxis..."
if ! node -c server.js; then
    echo "❌ Error de sintaxis en server.js"
    exit 1
fi

# 3. Commit de cambios
echo "📝 Guardando cambios..."
git add .
git commit -m "Despliegue seguro: $(date +%Y%m%d_%H%M%S)"

# 4. Desplegar
echo "🌐 Desplegando en Vercel..."
if npx vercel --prod --yes; then
    echo "✅ Despliegue exitoso!"
    echo ""
    echo "🔗 App disponible en: https://organizacion-familiar.vercel.app"
    echo ""
    echo "📱 Enlaces de acceso:"
    echo "- Javier: https://organizacion-familiar.vercel.app/javier/abc123xyz789def456"
    echo "- Raquel: https://organizacion-familiar.vercel.app/raquel/uvw012rst345ghi678"
    echo "- Mario: https://organizacion-familiar.vercel.app/mario/jkl901mno234pqr567"
    echo "- Alba: https://organizacion-familiar.vercel.app/alba/stu890vwx123yzb456"
    echo "- Admin: https://organizacion-familiar.vercel.app/admin/cde789fgh012ijl345"
else
    echo "❌ Error en el despliegue"
    echo "💡 Puedes hacer rollback en: https://vercel.com/dashboard"
    exit 1
fi