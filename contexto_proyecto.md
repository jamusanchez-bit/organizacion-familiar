# Contexto del Proyecto

## Estado Actual
El proyecto de desarrollo web está funcionando básicamente, pero necesita completar las secciones según las especificaciones detalladas.

## Información Transferida de TRANSFERENCIA_CHATGPT.md

### Estado actual y plataforma
- Plataforma: Digital Ocean
- URL: https://organizacion-familiar-stable-ir43j.ondigitalocean.app
- Costo: $10.56/mes
- Repositorio: https://github.com/jamusanchez-bit/organizacion-familiar
- Archivo principal: working.cjs
- Puerto: 10000
- Deploy: Automático desde GitHub main branch
- Enlaces de acceso: Javier, Raquel, Mario, Alba, Admin (ver TRANSFERENCIA_CHATGPT.md para enlaces completos)
- Estado técnico: Base y Ca'mon funcionando. API_KEY configurada. Faltan secciones por implementar según especificaciones.

### Especificaciones de secciones
- Actividades: Dividida en 4 categorías (Javier, Raquel, Mario, Alba). Cada categoría pertenece a un usuario con un perfil de acceso específico.
  - Calendario con vista diaria/semanal, mostrando solo las actividades del usuario.
  - Javi (Admin) añade actividades para cada usuario.
  - Usuarios solo pueden marcar actividades como "Hecho" o "No hecho".
  - Campos adicionales: Duración en minutos, repetición (similar a Google Calendar).
- Comidas: Planning semanal, tabla lunes-domingo, filas de comidas diferenciadas, integración con recetas/inventario.
- Recetas: Subcategorías comidas/cenas, lista ingredientes, tiempo, porciones.
- Inventario: Categorías y campos detallados, admin puede editar, usuarios solo ven y ajustan cantidad.
- Lista de la compra: Auto-generada según inventario, categorías, sugerencias.
- Mensajes: Chat grupal, privados, sugerencias admin, notificaciones.
- Ca'mon: Acceso personalizado, 6 niveles, pruebas, ejercicios, historial, chat con voz GPT-4o.
- Frases motivadoras diarias: 365 frases, parte superior del sidebar, sistema de numeración por fecha.

### Reglas críticas del proyecto
- Disciplina extrema para estabilidad: Solo 1 ejecutable, no cambiar configuraciones funcionando, backup obligatorio, cambios mínimos y verificados.
- Protocolo de cambios obligatorio: Backup y commit antes de cada cambio, cambios mínimos y verificados.
- Honestidad técnica absoluta: No adivinar, preguntar si hay dudas.
- Evaluación de impacto antes de cambios: Analizar riesgos antes de modificar.
- No tocar lo que funciona: Crear archivos nuevos para nuevas funcionalidades, backup siempre antes de modificar el principal.
- Sencillez y estabilidad: Priorizar la estabilidad y simplicidad.
- Perfeccionismo: Cuidar detalles, diseño intuitivo y atractivo (inspiración WhatsApp para mensajes).
- Consentimiento: No añadir contenido sin consentimiento, pero puedes programar sin pedir permiso si es mejor para el proyecto.
- Backup automático tras cambios correctos.

### Información técnica crítica
- working.cjs es el archivo principal
- Puerto 10000
- Base de datos en memoria
- APIs: Solo POST
- Frontend: HTML/CSS/JS vanilla
- Usuarios definidos (Javier, Raquel, Mario, Alba, Admin)
- Configuración Digital Ocean: Web Service, variable API_KEY, auto-deploy desde GitHub
- Versiones estables guardadas y comandos de restauración
- Problemas conocidos: errores con template literals, demora en updates, verificar sintaxis antes de commit

### Próximos pasos recomendados
1. Verificar estado actual y enlaces
2. Frases motivadoras en sidebar
3. Expandir inventario
4. Implementar recetas completas
5. Sistema de mensajes WhatsApp
6. Lista de compra auto-generada
7. Planning de comidas semanal

### Comandos útiles
- Verificar sintaxis: node -c working.cjs
- Backup y commit: git add . && git commit -m "Backup: [desc]" && git push origin main
- Restaurar versión estable: git checkout v3.0-camon-completo -- working.cjs
- Logs: Digital Ocean Dashboard

### Contacto/accesos
- Repositorio GitHub, Digital Ocean, OpenAI API configurada

## Especificaciones y Reglas
- Debo guardar cada pauta, información o especificación nueva que el usuario proporcione en este archivo.
- El archivo servirá como referencia central para el contexto de desarrollo.
- Se deben completar las secciones del proyecto de acuerdo a las instrucciones del usuario.

## Historial de Cambios
- 1. Se crea el archivo y se almacena el estado actual, especificaciones y reglas iniciales del proyecto.
