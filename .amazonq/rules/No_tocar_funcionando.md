REGLA CRÍTICA: NUNCA TOCAR LO QUE FUNCIONA

Si algo está funcionando en producción:
1. NO modificar archivos principales (index.js, package.json, railway.json)
2. NO cambiar configuraciones de despliegue
3. SIEMPRE crear archivos NUEVOS para funcionalidades adicionales
4. SIEMPRE hacer backup antes de cualquier cambio
5. Si necesitas integrar algo nuevo, hazlo SIN tocar lo existente

ANTES de cualquier cambio:
```bash
git add . && git commit -m "Backup antes de cambios"
```

NUNCA cambies:
- El archivo principal que está desplegado
- Las configuraciones de Railway
- Los enlaces que ya funcionan

SIEMPRE añade funcionalidades como archivos separados o rutas adicionales.