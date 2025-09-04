REGLA CRÍTICA: PROTECCIÓN DEL ESTADO FUNCIONANDO

## ESTADO ACTUAL FUNCIONANDO (NO TOCAR):
- Commit: 6138bfa "Funcionalidad completada: ejercicios diarios mejorados"
- Tag estable: v2.0-camon-estable
- Archivo principal: index.js (Railway lo ejecuta según railway.json)
- App principal: ✅ Funcionando
- Sección Ca'mon: ✅ Funcionando completamente
- Ejercicios diarios: ✅ Gramática y Reading implementados
- Prueba de nivel: ✅ 25 preguntas Cambridge
- Sistema de usuarios: ✅ 25 subniveles A1.1-C2.5

## ANTES DE CUALQUIER CAMBIO:
1. SIEMPRE hacer backup: `git add . && git commit -m "Backup antes de [cambio]"`
2. NUNCA tocar index.js sin backup
3. NUNCA cambiar railway.json
4. Si algo se rompe: `git checkout v2.0-camon-estable -- index.js`

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