#!/bin/bash

# Create Master v.26 backup
echo "Creating Master v.26 backup..."

# Create backup with selective exclusions
tar -czf Master.v.26.backup.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=*.log \
  --exclude=dist \
  --exclude=Master.v.*.backup.tar.gz \
  --exclude=backup_* \
  --exclude=backups \
  .

# Check if backup was created successfully
if [ -f "Master.v.26.backup.tar.gz" ]; then
    echo "✅ Master v.26 backup created successfully!"
    ls -lh Master.v.26.backup.tar.gz
else
    echo "❌ Failed to create backup"
    exit 1
fi