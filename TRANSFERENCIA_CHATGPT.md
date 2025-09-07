# TRANSFERENCIA COMPLETA DEL PROYECTO - ORGANIZACIÓN FAMILIAR

## ESTADO ACTUAL DEL PROYECTO

### PLATAFORMA ACTUAL: DIGITAL OCEAN
- **URL:** https://organizacion-familiar-stable-ir43j.ondigitalocean.app
- **Costo:** $10.56/mes
- **Repositorio GitHub:** https://github.com/jamusanchez-bit/organizacion-familiar
- **Archivo principal:** working.cjs
- **Puerto:** 10000
- **Deploy:** Automático desde GitHub main branch

### ENLACES DE ACCESO FUNCIONANDO
- **Javier:** https://organizacion-familiar-stable-ir43j.ondigitalocean.app/javier/abc123xyz789def456
- **Raquel:** https://organizacion-familiar-stable-ir43j.ondigitalocean.app/raquel/uvw012rst345ghi678
- **Mario:** https://organizacion-familiar-stable-ir43j.ondigitalocean.app/mario/jkl901mno234pqr567
- **Alba:** https://organizacion-familiar-stable-ir43j.ondigitalocean.app/alba/stu890vwx123yzb456
- **Admin:** https://organizacion-familiar-stable-ir43j.ondigitalocean.app/admin/cde789fgh012ijl345

### ESTADO TÉCNICO
- ✅ **Base funcionando:** Enlaces de usuarios operativos
- ✅ **Ca'mon completo:** Chat de voz con OpenAI GPT-4o funcionando
- ✅ **Variable de entorno:** API_KEY configurada en Digital Ocean
- ❌ **Secciones incompletas:** Faltan implementar según especificaciones

## ESPECIFICACIONES COMPLETAS DE CADA SECCIÓN

### SECCIÓN ACTIVIDADES
- **4 categorías:** Javier, Raquel, Mario, Alba (cada usuario ve solo las suyas)
- **Calendario:** Vista diaria/semanal con horarios y días
- **Admin (javi_administrador):** Añade actividades para todos
- **Usuarios:** Solo pueden marcar "Hecho"/"No hecho"
- **Campos actividad:** Duración (minutos), repetición (días seleccionables como Google Calendar)

### SECCIÓN COMIDAS
- **Planning semanal:** Empezar semana 1-7 septiembre, botón avanzar semanas
- **Tabla atractiva:** Lunes-Domingo como columnas
- **Filas:** Desayuno Alba y Mario, Desayuno Raquel y Javier, Almuerzo Alba y Mario, Almuerzo Raquel y Javier, Comida, Merienda Alba y Mario, Merienda Raquel y Javier, Cena
- **Usuarios:** Solo leer y marcar como "hecho"
- **Admin:** Rellenar cuadrículas con texto o recetas del sistema
- **Integración:** Recetas descontarán ingredientes del inventario automáticamente

### SECCIÓN RECETAS
- **2 subcategorías:** Comidas, Cenas
- **Campos:** Lista ingredientes (del inventario), tiempo (horas), porciones (defecto: 4)

### SECCIÓN INVENTARIO
- **Categorías:** carne, pescado, verdura, fruta, frutos secos, productos limpieza/hogar, otros
- **Campos:** Categoría, Se compra en (Carne internet, Pescadería, Del bancal a casa, Alcampo, Internet, Otros), Medida (unidades, litros, botes, tarros, cartones, latas), Cantidad
- **Admin:** Añadir/editar/eliminar productos
- **Usuarios:** Solo ver nombre, cantidad y botones +/-

### SECCIÓN LISTA DE LA COMPRA
- **Auto-generación:** Cantidad 0 = lista compra, Cantidad 1 = sugerencia
- **Categorías:** Carne internet, Pescadería, Del bancal a casa, Alcampo, Internet, Otros
- **Lista sugerencias:** Todos los productos disponibles para añadir

### SECCIÓN MENSAJES (como WhatsApp)
#### Chat de grupo:
- Todos los usuarios (Javier, Raquel, Mario, Alba)
- Mensajes con hora/fecha, cada usuario puede eliminar solo los suyos
#### Chats privados:
- Cada usuario ve 3 chats (con otros usuarios, sin Admin)
#### Sugerencias para administrador:
- Cualquier usuario puede escribir al Admin
- Admin solo accede a esta parte
#### Notificaciones:
- Número mensajes sin leer en chat y botón "Mensajes" del sidebar

### SECCIÓN CA'MON (YA FUNCIONANDO)
- **Acceso personalizado:** Cada usuario (Javier, Raquel, Mario, Alba) tiene acceso personal
- **Administrador NO tiene acceso**
- **Contenidos:** Basados en Cambridge University Press & Assessment
- **Estructura:** 6 niveles (A1, A2, B1, B2, C1, C2) con 5 subniveles cada uno (total: 25)
- **3 botones principales:**
  1. **Prueba inicial:** 25 preguntas (10 gramática + 15 opción múltiple)
  2. **Ejercicios diarios:** Gramática, Reading, Chat con Elizabeth
  3. **Mi evolución:** Historial y sistema de subida/bajada de nivel
- **Chat Elizabeth:** OpenAI GPT-4o con voz, mínimo 10 minutos

### FRASES MOTIVADORAS DIARIAS
- **Ubicación:** Parte superior del sidebar
- **Formato:** Fecha + frase del día
- **Sistema:** 365 frases numeradas (1 enero = frase 1, etc.)
- **Lista completa disponible en:** .amazonq/rules/Frases_motivadoras_365.md

## REGLAS CRÍTICAS DEL PROYECTO

### DISCIPLINA EXTREMA PARA ESTABILIDAD
**NUNCA MÁS RECREAR PROYECTOS POR ERRORES EVITABLES**
- Solo 1 archivo ejecutable (working.cjs)
- NUNCA cambiar configuraciones funcionando
- Backup obligatorio antes de cualquier cambio
- Cambios mínimos, uno a la vez
- Verificar cada cambio antes del siguiente

### PROTOCOLO DE CAMBIOS OBLIGATORIO
```bash
# SIEMPRE antes de cualquier cambio:
git add . && git commit -m "Backup antes de [descripción]"
# Hacer cambio mínimo
# Verificar que funciona
# Solo entonces continuar
```

### HONESTIDAD TÉCNICA ABSOLUTA
- NUNCA adivinar o asumir
- SIEMPRE preguntar si no estás seguro
- ADMITIR inmediatamente la incertidumbre
- PEDIR información específica cuando sea necesario

### EVALUACIÓN DE IMPACTO ANTES DE CAMBIOS
Antes de cualquier cambio, evaluar:
1. ¿Puede romper funcionalidades existentes?
2. ¿Requiere modificar JavaScript complejo?
3. ¿Afecta archivos críticos?
4. ¿Es realmente necesario?
5. ¿Hay alternativa más simple?

### NO TOCAR LO QUE FUNCIONA
- Si algo funciona en producción, NO modificarlo
- SIEMPRE crear archivos NUEVOS para funcionalidades adicionales
- SIEMPRE hacer backup antes de cualquier cambio
- NUNCA cambiar el archivo principal sin backup

### SENCILLEZ Y ESTABILIDAD
- La sencillez es más importante que la perfección
- Un sistema que funciona es mejor que uno "perfecto" roto
- Estabilidad garantiza que lo que funciona hoy siga funcionando mañana

### PERFECCIONISMO
- Hay que cuidar todos los detalles
- Diseño atractivo, intuitivo, fácil y rápido de usar
- Inspiración: Cuanto más parecido a WhatsApp (mensajes), mejor

### CONSENTIMIENTO
- No añadir contenido a la web sin consentimiento del usuario
- Puedes programar todo lo necesario sin pedir permiso
- Si es mejor para el proyecto: hazlo

### BACKUP AUTOMÁTICO
Después de cada cambio que funcione correctamente:
```bash
git add working.cjs && git commit -m "Funcionalidad completada: [descripción breve]"
```

## INFORMACIÓN TÉCNICA CRÍTICA

### ESTRUCTURA DEL CÓDIGO
- **Archivo principal:** working.cjs
- **Puerto:** 10000 (process.env.PORT || 10000)
- **Base de datos:** En memoria (arrays y objetos JavaScript)
- **APIs:** Rutas POST para todas las operaciones
- **Frontend:** HTML/CSS/JavaScript vanilla integrado en el servidor

### USUARIOS DEL SISTEMA
```javascript
const USERS = {
  javier: { id: 'javier', name: 'Javier', password: 'password123' },
  raquel: { id: 'raquel', name: 'Raquel', password: 'password456' },
  mario: { id: 'mario', name: 'Mario', password: 'password789' },
  alba: { id: 'alba', name: 'Alba', password: 'password000' },
  javi_administrador: { id: 'javi_administrador', name: 'Javi (Admin)', password: 'admin123' }
};
```

### CONFIGURACIÓN DIGITAL OCEAN
- **Tipo:** Web Service
- **Run Command:** node working.cjs
- **HTTP Port:** 10000
- **Plan:** $10.56/mes (512 MB RAM)
- **Variable de entorno:** API_KEY (OpenAI)
- **Auto-deploy:** Activado desde GitHub main branch

### VERSIONES ESTABLES GUARDADAS
- **v3.0-camon-completo:** Ca'mon completo funcionando
- **Comando restauración:** `git checkout v3.0-camon-completo -- working.cjs`

### PROBLEMAS CONOCIDOS
- Template literals en JavaScript pueden causar errores de sintaxis
- Digital Ocean a veces tarda en actualizar (2-3 minutos)
- Verificar siempre sintaxis antes de commit: `node -c working.cjs`

## PRÓXIMOS PASOS RECOMENDADOS

1. **Verificar estado actual:** Probar todos los enlaces de usuarios
2. **Implementar frases motivadoras:** Añadir al sidebar con las 365 frases
3. **Expandir inventario:** 20 productos en 6 categorías
4. **Implementar recetas completas:** Con ingredientes del inventario
5. **Sistema de mensajes WhatsApp:** 3 tipos de chat
6. **Lista de compra auto-generada:** Basada en inventario
7. **Planning de comidas:** Tabla semanal completa

## COMANDOS ÚTILES

### Verificar sintaxis
```bash
node -c working.cjs
```

### Backup y commit
```bash
git add . && git commit -m "Backup: [descripción]"
git push origin main
```

### Restaurar versión estable
```bash
git checkout v3.0-camon-completo -- working.cjs
```

### Ver logs de Digital Ocean
Ir a Dashboard → Apps → organizacion-familiar-stable → Runtime Logs

## CONTACTO Y ACCESOS
- **Repositorio:** https://github.com/jamusanchez-bit/organizacion-familiar
- **Digital Ocean:** Panel de control con acceso completo
- **OpenAI API:** Configurada como variable de entorno API_KEY

---

**NOTA IMPORTANTE:** El proyecto está en estado funcional básico. Ca'mon está completo y operativo. Las demás secciones necesitan implementación según las especificaciones detalladas arriba. Seguir siempre las reglas de disciplina extrema para evitar romper lo que ya funciona.