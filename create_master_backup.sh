#!/bin/bash

# Master Database Backup Script for Math Tutoring Application
# Creates both binary and SQL format backups with timestamp

VERSION="Master.v.20"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create binary backup (for PostgreSQL restore)
echo "Creating binary backup..."
pg_dump $DATABASE_URL \
  --verbose \
  --clean \
  --no-owner \
  --no-privileges \
  --format=custom \
  --file="$BACKUP_DIR/${VERSION}.backup.${TIMESTAMP}.dump"

# Create SQL backup (human-readable)
echo "Creating SQL backup..."
pg_dump $DATABASE_URL \
  --verbose \
  --clean \
  --no-owner \
  --no-privileges \
  --format=plain \
  --file="$BACKUP_DIR/${VERSION}.backup.${TIMESTAMP}.sql"

echo "Backup completed successfully!"
echo "Files created:"
echo "- $BACKUP_DIR/${VERSION}.backup.${TIMESTAMP}.dump (binary format)"
echo "- $BACKUP_DIR/${VERSION}.backup.${TIMESTAMP}.sql (SQL format)"

# Show database statistics
echo ""
echo "Database Statistics:"
psql $DATABASE_URL -c "
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows
FROM pg_stat_user_tables 
WHERE schemaname = 'public' 
ORDER BY live_rows DESC;
"

echo ""
echo "Master v.20 Features:"
echo "- Complete dynamic lesson processing for ALL 6.NS standards"
echo "- Universal interactive components (Number Line, Ordering, Comparison, Word Problems, Exponents, Perfect Squares, Fractions, Scaling)"
echo "- Enhanced visual design with gradient backgrounds and modern styling"
echo "- Consistent submit button behavior across all components"
echo "- Comprehensive curriculum database with 457+ lessons"
echo "- Advanced AI tutoring system with contextual help"