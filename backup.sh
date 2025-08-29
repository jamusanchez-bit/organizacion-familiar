#!/bin/bash
# Script de backup automático
cp working.cjs "backups/working_$(date +%Y%m%d_%H%M%S).cjs"
echo "Backup creado: backups/working_$(date +%Y%m%d_%H%M%S).cjs"