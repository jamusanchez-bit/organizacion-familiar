PROTOCOLO DE RECUPERACIÓN INMEDIATA

Cuando algo se rompe:

1. INMEDIATAMENTE hacer rollback:
```bash
git log --oneline -10
git checkout <ultimo_commit_funcionando>
git push origin main --force
```

2. Verificar que funciona:
```bash
curl https://organizacion-familiar-stable-ir43j.ondigitalocean.app/javier/abc123xyz789def456
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

## VERSIONES ESTABLES GUARDADAS:

### v3.0-camon-completo (ACTUAL)
- Ca'mon completo funcionando
- Chat de voz con OpenAI GPT-4o
- 5 secciones: Nivel, Prueba, Ejercicios, Chat, Evolución
- 25 subniveles A1.1-C2.5
- Reconocimiento y síntesis de voz
- Timer de chat funcionando

**RESTAURAR:** `git checkout v3.0-camon-completo -- working.cjs`

### v2.0-camon-estable (ANTERIOR)
- Sistema básico funcionando
- Ca'mon integrado con sidebar

**RESTAURAR:** `git checkout v2.0-camon-estable -- working.cjs`