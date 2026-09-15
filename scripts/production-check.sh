#!/usr/bin/env bash
set -euo pipefail

fail=0
check_required() {
  local name="$1" value="${!1:-}"
  if [ -z "$value" ]; then echo "FAIL: $name is not set"; fail=1; else echo "OK:   $name is set"; fi
}

check_required DATABASE_PASSWORD
check_required JWT_SECRET
check_required FRONTEND_URL
check_required MAIL_HOST
check_required MAIL_FROM
check_required SMS_PROVIDER

if [ "${DEV_MODE:-true}" != "false" ]; then echo "FAIL: DEV_MODE must be false"; fail=1; else echo "OK:   DEV_MODE=false"; fi
if [ "${SEED_DEMO:-true}" != "false" ]; then echo "FAIL: SEED_DEMO must be false"; fail=1; else echo "OK:   SEED_DEMO=false"; fi
if [ "${MAIL_ENABLED:-false}" != "true" ]; then echo "FAIL: MAIL_ENABLED must be true"; fail=1; else echo "OK:   MAIL_ENABLED=true"; fi
if [ "${DATABASE_PASSWORD:-}" = "soulsync_dev" ]; then echo "FAIL: default database password is forbidden"; fail=1; fi
jwt_secret="${JWT_SECRET:-}"
if [ ${#jwt_secret} -lt 32 ]; then echo "FAIL: JWT_SECRET must be at least 32 characters"; fail=1; else echo "OK:   JWT_SECRET length"; fi
if [[ "${FRONTEND_URL:-}" != https://* ]]; then echo "FAIL: FRONTEND_URL must start with https://"; fail=1; else echo "OK:   FRONTEND_URL uses HTTPS"; fi
if [ "${SMS_PROVIDER:-dev}" != "twilio" ]; then echo "FAIL: production currently requires SMS_PROVIDER=twilio"; fail=1; fi
if [ "${SMS_PROVIDER:-}" = "twilio" ]; then
  check_required TWILIO_ACCOUNT_SID
  check_required TWILIO_AUTH_TOKEN
  check_required TWILIO_FROM_NUMBER
fi

if [ "$fail" -ne 0 ]; then
  echo "Production configuration check FAILED."
  exit 1
fi

echo "Production configuration check PASSED."
