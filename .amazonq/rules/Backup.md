Después de cada cambio que funcione correctamente, ejecuta automáticamente:
```bash
git add working.cjs && git commit -m "Funcionalidad completada: [descripción breve]"
```

Si el cambio es muy importante, también ejecuta:
```bash
./backup.sh
```

NUNCA hagas commit de código que no funcione.