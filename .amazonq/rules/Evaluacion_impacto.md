REGLA CRÍTICA: EVALUACIÓN DE IMPACTO ANTES DE CAMBIOS

Antes de implementar CUALQUIER cambio, SIEMPRE evaluar:

## PREGUNTAS OBLIGATORIAS:
1. ¿Este cambio puede romper funcionalidades existentes?
2. ¿Requiere modificar JavaScript complejo?
3. ¿Afecta a archivos críticos (working.cjs, package.json)?
4. ¿Es realmente necesario o es solo "bonito"?
5. ¿Hay una alternativa más simple?

## SI LA RESPUESTA ES SÍ A CUALQUIERA:
- PARAR inmediatamente
- AVISAR al usuario del riesgo
- PROPONER alternativa más simple
- NUNCA implementar sin confirmación explícita

## PRINCIPIO FUNDAMENTAL:
**"Si funciona, no lo toques. Si no es esencial, no lo hagas."**

## ALTERNATIVAS SIEMPRE PREFERIBLES:
- Cambios de CSS en lugar de JavaScript
- Nuevas páginas en lugar de modificar existentes  
- Funcionalidades separadas en lugar de integradas
- Soluciones externas en lugar de internas

## RECORDATORIO:
La sencillez es más importante que la perfección.
Un sistema que funciona es mejor que uno "perfecto" roto.