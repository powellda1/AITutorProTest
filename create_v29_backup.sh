#!/bin/bash

# Master v.29 Backup Script - 6.NS.1.b Universal System Complete
# Date: July 15, 2025
# Features: Complete 6.NS.1.b decimal-percent conversion with universal theming

echo "Creating Master v.29 backup..."

# Get current timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p backups

# Create tar.gz backup excluding unnecessary files
tar -czf "Master.v.29.backup.${TIMESTAMP}.tar.gz" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='*.log' \
    --exclude='Master.v.*.backup*' \
    --exclude='backup_*' \
    --exclude='backups' \
    --exclude='attached_assets' \
    --exclude='workspace' \
    --exclude='*.dump' \
    --exclude='*.sql' \
    --exclude='create_*_backup.sh' \
    --exclude='load_*.mjs' \
    --exclude='load_*.js' \
    --exclude='test_*.js' \
    --exclude='test_*.mjs' \
    --exclude='*.html' \
    --exclude='*.json' \
    --exclude='example_*.json' \
    --exclude='curriculum_*.sql' \
    --exclude='demo_*.html' \
    --exclude='upload_*.html' \
    --exclude='*.tar.gz' \
    --exclude='*.tar' \
    .

# Check if backup was created successfully
if [ -f "Master.v.29.backup.${TIMESTAMP}.tar.gz" ]; then
    echo "✅ Backup created successfully: Master.v.29.backup.${TIMESTAMP}.tar.gz"
    
    # Get file size
    SIZE=$(ls -lh "Master.v.29.backup.${TIMESTAMP}.tar.gz" | awk '{print $5}')
    echo "📦 Backup size: $SIZE"
    
    # Test backup integrity by extracting to temporary directory
    echo "🔍 Testing backup integrity..."
    mkdir -p /tmp/backup_test_v29
    
    if tar -xzf "Master.v.29.backup.${TIMESTAMP}.tar.gz" -C /tmp/backup_test_v29; then
        echo "✅ Backup integrity verified - extraction successful"
        
        # Check if key files exist
        if [ -f "/tmp/backup_test_v29/package.json" ] && [ -f "/tmp/backup_test_v29/replit.md" ]; then
            echo "✅ Key files verified in backup"
        else
            echo "❌ Missing key files in backup"
            exit 1
        fi
        
        # Clean up test directory
        rm -rf /tmp/backup_test_v29
        
        # Create convenience symlink to latest backup
        ln -sf "Master.v.29.backup.${TIMESTAMP}.tar.gz" Master.v.29.backup.tar.gz
        
        echo "✅ Master v.29 backup completed successfully"
        echo "📁 Backup file: Master.v.29.backup.${TIMESTAMP}.tar.gz"
        echo "🔗 Symlink: Master.v.29.backup.tar.gz"
        
    else
        echo "❌ Backup integrity test failed - extraction error"
        exit 1
    fi
else
    echo "❌ Backup creation failed"
    exit 1
fi