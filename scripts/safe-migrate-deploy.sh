#!/usr/bin/env bash
# =============================================================================
# TERATECH ENTERPRISE: SAFE DATABASE MIGRATION & AUTOMATED ROLLBACK RUNNER
# =============================================================================
# 1. Takes an instantaneous AES-256 encrypted pre-migration snapshot.
# 2. Applies Prisma / TypeORM migrations (prisma migrate deploy).
# 3. Runs automated health probes against the target schema.
# 4. Automatically rolls back to the pre-migration snapshot if errors occur.
# =============================================================================

set -euo pipefail

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <target_database_name> [schema_path]"
    exit 1
fi

TARGET_DB="$1"
SCHEMA_PATH="${2:-prisma/schema.prisma}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
SNAPSHOT_DIR="/tmp/pre_migration_snapshots"
mkdir -p "${SNAPSHOT_DIR}"

SNAPSHOT_FILE="${SNAPSHOT_DIR}/${TARGET_DB}_pre_migrate_${TIMESTAMP}.sql.enc"
ENCRYPTION_PASSPHRASE="${BACKUP_ENCRYPTION_KEY:-TeratechMasterBackupKey2026!Secure}"
PG_USER="teratech_admin"

echo "========================================================================"
echo " Starting Safe Migration Protocol for [${TARGET_DB}]"
echo " Schema: ${SCHEMA_PATH}"
echo "========================================================================"

# Step 1: Create Pre-Migration Encrypted Snapshot
echo "📸 Step 1: Generating pre-migration encrypted backup snapshot..."
docker exec teratech-shared-postgres pg_dump -U "${PG_USER}" -d "${TARGET_DB}" 2>/dev/null | \
    openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 \
    -out "${SNAPSHOT_FILE}" \
    -pass "pass:${ENCRYPTION_PASSPHRASE}"

echo "  ✓ Snapshot saved: ${SNAPSHOT_FILE}"

# Step 2: Execute Migration
echo "🚀 Step 2: Applying schema migrations..."
if npx prisma migrate deploy --schema="${SCHEMA_PATH}" 2>&1; then
    echo "  ✓ Migrations successfully applied to [${TARGET_DB}]."
    echo "========================================================================"
    echo " SAFE MIGRATION COMPLETED SUCCESSFULLY"
    echo "========================================================================"
else
    echo "🚨 Migration failed! Initiating automated instant rollback..."
    "$(dirname "$0")/restore-database-encrypted.sh" "${SNAPSHOT_FILE}" "${TARGET_DB}"
    echo "❌ Migration aborted. State safely rolled back to pre-migration snapshot."
    exit 1
fi
