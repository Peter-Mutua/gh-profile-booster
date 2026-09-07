#!/usr/bin/env bash
# =============================================================================
# TERATECH ENTERPRISE: INFRASTRUCTURE AUTO-HEALING & HEALTH MONITORING DAEMON
# =============================================================================
# Continuously monitors all critical ecosystem containers, restarts unhealthy
# instances automatically, and dispatches incident alerts to the superadmin.
# =============================================================================

set -euo pipefail

SUPERADMIN_EMAIL="petermwendwa94@gmail.com"
OMNICOMMS_URL="${OMNICOMMS_URL:-http://localhost:7890/api/v1/messages/send}"
CHECK_INTERVAL_SECONDS=15

CRITICAL_CONTAINERS=(
    "teratech-shared-gateway"
    "teratech-shared-postgres"
    "teratech-shared-redis"
    "teratech-shared-rabbitmq"
    "teratech-shared-kafka"
    "teratech-shared-minio"
    "teratech-shared-mongodb"
    "teratech-shared-prometheus"
    "teratech-shared-grafana"
    "teratech-shared-ollama"
)

echo "========================================================================"
echo " Starting Teratech Infrastructure Auto-Healing Daemon"
echo " Master SuperAdmin: ${SUPERADMIN_EMAIL}"
echo " Monitored Containers: ${#CRITICAL_CONTAINERS[@]}"
echo "========================================================================"

check_and_heal() {
    for CONTAINER in "${CRITICAL_CONTAINERS[@]}"; do
        STATUS=$(docker inspect --format='{{.State.Status}}' "${CONTAINER}" 2>/dev/null || echo "not_found")
        
        if [ "${STATUS}" != "running" ]; then
            echo "🚨 [OUTAGE DETECTED] Container [${CONTAINER}] is in state: ${STATUS}"
            echo "🔧 Attempting automated recovery: restarting ${CONTAINER}..."
            
            docker restart "${CONTAINER}" || docker start "${CONTAINER}" || true
            
            NEW_STATUS=$(docker inspect --format='{{.State.Status}}' "${CONTAINER}" 2>/dev/null || echo "failed")
            if [ "${NEW_STATUS}" == "running" ]; then
                echo "✅ [RECOVERED] Container [${CONTAINER}] successfully restarted."
                # Dispatch alert via OmniComms
                curl -s -X POST "${OMNICOMMS_URL}" \
                    -H "Content-Type: application/json" \
                    -d "{\"recipient\": \"${SUPERADMIN_EMAIL}\", \"channel\": \"EMAIL\", \"subject\": \"[AUTO-HEALED] ${CONTAINER} Recovered\", \"body\": \"Container ${CONTAINER} degraded to ${STATUS} and was automatically restored to healthy state at $(date).\"}" >/dev/null 2>&1 || true
            else
                echo "❌ [CRITICAL FAILURE] Container [${CONTAINER}] failed to auto-recover!"
            fi
        else
            echo "  🟢 [HEALTHY] ${CONTAINER} (Status: running)"
        fi
    done
}

if [ "${1:-once}" == "--daemon" ]; then
    while true; do
        check_and_heal
        sleep "${CHECK_INTERVAL_SECONDS}"
    done
else
    check_and_heal
fi
