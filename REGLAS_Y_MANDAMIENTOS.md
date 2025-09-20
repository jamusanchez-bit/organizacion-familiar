# Reglas y Mandamientos

## Reglas Críticas del Proyecto

### Disciplina extrema para estabilidad
- NUNCA más recrear proyectos por errores evitables
- Solo 1 archivo ejecutable (working.cjs)
- NUNCA cambiar configuraciones funcionando
- Backup obligatorio antes de cualquier cambio
- Cambios mínimos, uno a la vez
- Verificar cada cambio antes del siguiente

### Protocolo de cambios obligatorio
```
git add . && git commit -m "Backup antes de [descripción]"
# Hacer cambio mínimo
# Verificar que funciona
# Solo entonces continuar
```

### Honestidad técnica absoluta
- NUNCA adivinar o asumir
- SIEMPRE preguntar si no estás seguro
- ADMITIR inmediatamente la incertidumbre
- PEDIR información específica cuando sea necesario

### Evaluación de impacto antes de cambios
1. ¿Puede romper funcionalidades existentes?
2. ¿Requiere modificar JavaScript complejo?
3. ¿Afecta archivos críticos?
4. ¿Es realmente necesario?
5. ¿Hay alternativa más simple?

### No tocar lo que funciona
- Si algo funciona en producción, NO modificarlo
- SIEMPRE crear archivos NUEVOS para funcionalidades adicionales
- SIEMPRE hacer backup antes de cualquier cambio
- NUNCA cambiar el archivo principal sin backup

### Sencillez y estabilidad
- La sencillez es más importante que la perfección
- Un sistema que funciona es mejor que uno "perfecto" roto
- Estabilidad garantiza que lo que funciona hoy siga funcionando mañana

### Perfeccionismo
- Hay que cuidar todos los detalles
- Diseño atractivo, intuitivo, fácil y rápido de usar
- Inspiración: Cuanto más parecido a WhatsApp (mensajes), mejor

### Consentimiento
- No añadir contenido a la web sin consentimiento del usuario
- Puedes programar todo lo necesario sin pedir permiso
- Si es mejor para el proyecto: hazlo

### Backup automático
```
git add working.cjs && git commit -m "Funcionalidad completada: [descripción breve]"
```

## Mandamientos de Desarrollo

### Diseño
- Tipografía: Verdana o sans-serif
- Colores: Paleta verde/azul principal
- Espaciado: Botones en lista vertical, nunca amontonados
- Responsive: Móvil, tablets, iPhone, iPad prioritarios
- Simplicidad: Diseño limpio, sin elementos innecesarios

### Código
- Objetivo: Máxima sencillez
- Funcionalidad: Nunca romper características existentes
- Datos: Preservar siempre datos del usuario
- Performance: Código eficiente, sin redundancias
- Consistencia: Mismo estilo en todos los componentes
- Autonomía: Arreglar problemas directamente sin preguntar
- Comunicación: Preguntar antes de cambiar funcionalidad

### Minuciosidad y verificación
- Ser minucioso con cada cosa que se pida y comprobar que está hecho correctamente todo antes de seguir
- Verificar que todos los cambios solicitados se han implementado completamente
- No dar por terminada una tarea hasta confirmar que funciona correctamente
