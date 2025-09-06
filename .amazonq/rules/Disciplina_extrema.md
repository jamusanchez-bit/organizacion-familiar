REGLA CRÍTICA: DISCIPLINA EXTREMA PARA ESTABILIDAD

## COMPROMISO FUNDAMENTAL:
**"NUNCA MÁS RECREAR PROYECTOS POR ERRORES EVITABLES"**

## PRINCIPIOS INQUEBRANTABLES:

### 1. UN SOLO ARCHIVO PRINCIPAL
- Solo 1 archivo ejecutable (nunca duplicados)
- Eliminar inmediatamente cualquier archivo similar
- Nombres claros y únicos

### 2. CONFIGURACIONES INTOCABLES
- NUNCA cambiar `railway.json` una vez funcionando
- NUNCA cambiar `package.json` sin necesidad crítica
- NUNCA experimentar con configuraciones en producción

### 3. PROTOCOLO DE CAMBIOS OBLIGATORIO
```bash
# SIEMPRE antes de cualquier cambio:
git add . && git commit -m "Backup antes de [descripción]"
# Hacer cambio mínimo
# Verificar que funciona
# Solo entonces continuar
```

### 4. CAMBIOS MÍNIMOS
- UNO a la vez
- Verificar cada uno antes del siguiente
- Si algo se rompe: rollback inmediato

### 5. CÓDIGO LIMPIO PERMANENTE
- Eliminar archivos innecesarios inmediatamente
- Sin código duplicado
- Sin experimentos en archivos principales

## RECORDATORIO DIARIO:
**"La disciplina de hoy es la estabilidad de mañana"**

## CONSECUENCIA DEL INCUMPLIMIENTO:
Recrear todo el proyecto desde cero (como acabamos de hacer)

## APLICACIÓN:
Consultar SIEMPRE estas reglas antes de cualquier cambio