#!/bin/bash
# Simple backup script - creates a folder with all important files

BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Copy key files
cp -r server "$BACKUP_DIR/"
cp -r client "$BACKUP_DIR/"
cp -r shared "$BACKUP_DIR/"
cp package.json "$BACKUP_DIR/"
cp replit.md "$BACKUP_DIR/"
cp drizzle.config.ts "$BACKUP_DIR/"
cp vite.config.ts "$BACKUP_DIR/"
cp tailwind.config.ts "$BACKUP_DIR/"
cp tsconfig.json "$BACKUP_DIR/"

echo "Backup created in: $BACKUP_DIR"
echo "Copy this folder to your local computer"