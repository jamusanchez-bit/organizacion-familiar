REGLA CRÍTICA: LIMPIEZA DE CÓDIGO PARA ESTABILIDAD

## PRINCIPIO FUNDAMENTAL:
**"Solo lo esencial debe existir en producción"**

## ACCIONES OBLIGATORIAS CADA SEMANA:

### 1. ELIMINAR ARCHIVOS INNECESARIOS:
- Archivos de backup antiguos (más de 1 semana)
- Archivos de prueba (*-test.*, *-backup.*, *-old.*)
- Múltiples versiones del mismo archivo
- Archivos de configuración no utilizados

### 2. ELIMINAR CÓDIGO DUPLICADO:
- Funciones repetidas
- HTML duplicado
- CSS no utilizado
- Variables no utilizadas

### 3. MANTENER SOLO:
- 1 archivo principal por funcionalidad
- Archivos de configuración activos
- Dependencias realmente necesarias

## COMANDO DE LIMPIEZA SEMANAL:
```bash
# Mover archivos innecesarios
mkdir -p old-files
mv *-backup.* *-old.* *-test.* old-files/ 2>/dev/null || true
git add . && git commit -m "Limpieza semanal: archivos innecesarios movidos"
```

## BENEFICIOS:
- ✅ Menos confusión en despliegues
- ✅ Código más mantenible
- ✅ Menos errores de producción
- ✅ Mayor estabilidad

## RECORDATORIO:
**"Un proyecto limpio es un proyecto estable"**