PROTOCOLO DE RECUPERACIÓN INMEDIATA

Cuando algo se rompe:

1. INMEDIATAMENTE hacer rollback:
```bash
git log --oneline -10
git checkout <ultimo_commit_funcionando>
git push railway main --force
```

2. Verificar que funciona:
```bash
curl https://organizacion-familiar-production.up.railway.app/javier/abc123xyz789def456
```

3. Solo DESPUÉS de confirmar que funciona, investigar qué pasó

4. Para nuevas funcionalidades, usar SIEMPRE ramas separadas:
```bash
git checkout -b nueva-funcionalidad
# desarrollar
# probar localmente
# solo si funciona 100%, merge
```

NUNCA desarrollar directamente en main si hay algo funcionando en producción.