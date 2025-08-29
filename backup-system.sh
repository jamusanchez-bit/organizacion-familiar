#!/bin/bash

# Sistema de backup completo para Organización Familiar
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"

echo "🔄 Iniciando backup completo - $DATE"

# 1. Backup de código
echo "📁 Backup del código..."
git add .
git commit -m "Backup automático: $DATE" 2>/dev/null || echo "No hay cambios en el código"

# 2. Backup de base de datos
echo "🗄️ Backup de base de datos..."
if [ -f .env ]; then
    source .env
    if command -v pg_dump &> /dev/null; then
        pg_dump "$DATABASE_URL" > "$BACKUP_DIR/db_backup_$DATE.sql"
        echo "✅ Base de datos respaldada: db_backup_$DATE.sql"
    else
        echo "⚠️ pg_dump no encontrado, instalando..."
        brew install postgresql 2>/dev/null || echo "Instala PostgreSQL para backups de BD"
    fi
else
    echo "⚠️ Archivo .env no encontrado"
fi

# 3. Backup completo del proyecto
echo "📦 Creando archivo completo..."
tar -czf "$BACKUP_DIR/proyecto_completo_$DATE.tar.gz" \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=backups \
    --exclude=*.log \
    .

# 4. Limpiar backups antiguos (mantener últimos 10)
echo "🧹 Limpiando backups antiguos..."
ls -t $BACKUP_DIR/db_backup_*.sql 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null
ls -t $BACKUP_DIR/proyecto_completo_*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null

# 5. Mostrar estado
echo ""
echo "✅ Backup completado:"
echo "📊 Archivos de backup:"
ls -la $BACKUP_DIR/ | tail -n +2

echo ""
echo "🔗 Enlaces actuales:"
echo "- Javier: https://organizacion-familiar.vercel.app/javier/abc123xyz789def456"
echo "- Raquel: https://organizacion-familiar.vercel.app/raquel/uvw012rst345ghi678"
echo "- Mario: https://organizacion-familiar.vercel.app/mario/jkl901mno234pqr567"
echo "- Alba: https://organizacion-familiar.vercel.app/alba/stu890vwx123yzb456"
echo "- Admin: https://organizacion-familiar.vercel.app/admin/cde789fgh012ijl345"