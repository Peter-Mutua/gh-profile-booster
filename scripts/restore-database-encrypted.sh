#!/usr/bin/env bash
# =============================================================================
# TERATECH ENTERPRISE: ENCRYPTED SNAPSHOT DECRYPTION & RESTORATION TOOL
# =============================================================================
# Usage: ./restore-database-encrypted.sh <encrypted_file.sql.enc> <target_database>
# =============================================================================

set -euo pipefail

if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <path_to_encrypted_file.sql.enc> <target_database_name>"
    exit 1
fi

ENC_FILE="$1"
TARGET_DB="$2"
ENCRYPTION_PASSPHRASE="${BACKUP_ENCRYPTION_KEY:-TeratechMasterBackupKey2026!Secure}"
TEMP_SQL="/tmp/restore_${TARGET_DB}_$(date +%s).sql"
PG_USER="teratech_admin"

if [ ! -f "${ENC_FILE}" ]; then
    echo "❌ Error: Encrypted file ${ENC_FILE} not found."
    exit 1
fi

echo "🔓 Decrypting snapshot ${ENC_FILE} with AES-256-CBC..."
openssl enc -d -aes-256-cbc -pbkdf2 -iter 100000 \
    -in "${ENC_FILE}" \
    -out "${TEMP_SQL}" \
    -pass "pass:${ENCRYPTION_PASSPHRASE}"

echo "📥 Restoring into database [${TARGET_DB}]..."
docker exec -i teratech-shared-postgres psql -U "${PG_USER}" -d "${TARGET_DB}" < "${TEMP_SQL}"

echo "🧹 Securely wiping decrypted temporary file..."
rm -f "${TEMP_SQL}"

echo "✓ Database [${TARGET_DB}] restored successfully from encrypted snapshot."
