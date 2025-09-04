REGLA CRÍTICA: PROTECCIÓN DEL ESTADO FUNCIONANDO

## ESTADO ACTUAL FUNCIONANDO (NO TOCAR):
- Commit: 07c4b34 "Funcionalidad completada: app inglés en index.js"
- Archivo principal: index.js (Railway lo ejecuta según railway.json)
- App principal: ✅ Funcionando
- App inglés: ✅ Funcionando en /english
- Botón inglés: ✅ Funcionando

## ANTES DE CUALQUIER CAMBIO:
1. SIEMPRE hacer backup: `git add . && git commit -m "Backup antes de [cambio]"`
2. NUNCA tocar index.js sin backup
3. NUNCA cambiar railway.json
4. Si algo se rompe: `git checkout 07c4b34 -- index.js`

## ARCHIVOS CRÍTICOS:
- index.js (archivo principal que ejecuta Railway)
- railway.json (configuración de Railway)
- package.json (configuración del proyecto)

## PROTOCOLO DE CAMBIOS:
1. Backup
2. Cambio mínimo
3. Commit
4. Push
5. Verificar que funciona
6. Si no funciona: rollback inmediato

NUNCA hacer cambios múltiples sin verificar cada uno.