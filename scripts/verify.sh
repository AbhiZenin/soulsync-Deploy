#!/usr/bin/env bash
set -euo pipefail
API="${API_URL:-http://localhost:8080/api/v1}"
WEB="${WEB_URL:-http://localhost:3000}"

json_get() { python3 -c "import sys,json; d=json.load(sys.stdin); print(d$1 if d$1 is not None else '')"; }

echo "[1/10] Checking backend health..."
curl -fsS "${API%/api/v1}/actuator/health" | grep -q '"status":"UP"'

echo "[2/10] Checking frontend..."
curl -fsS "$WEB" >/dev/null

EMAIL="smoke-$(date +%s)@soulsync.dev"
PASSWORD='Password123!'
PHONE="+1555$(date +%s | tail -c 8)"

echo "[3/10] Registering $EMAIL..."
REGISTER=$(curl -fsS -X POST "$API/auth/register" -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"displayName\":\"Smoke Test\"}")
CODE=$(printf '%s' "$REGISTER" | json_get "['devVerificationCode']")
if ! [[ "$CODE" =~ ^[0-9]{6}$ ]]; then echo "No dev email OTP returned. Ensure DEV_MODE=true."; exit 1; fi

echo "[4/10] Verifying email OTP..."
curl -fsS -X POST "$API/auth/verify-email" -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"code\":\"$CODE\"}" >/dev/null

echo "[5/10] Logging in..."
LOGIN=$(curl -fsS -X POST "$API/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
ACCESS=$(printf '%s' "$LOGIN" | json_get "['accessToken']")
test -n "$ACCESS"
AUTH="Authorization: Bearer $ACCESS"

echo "[6/10] Verifying phone OTP..."
PHONE_REQUEST=$(curl -fsS -X POST "$API/account/phone/request" -H "$AUTH" -H 'Content-Type: application/json' -d "{\"phoneNumber\":\"$PHONE\"}")
PHONE_CODE=$(printf '%s' "$PHONE_REQUEST" | json_get "['devCode']")
if ! [[ "$PHONE_CODE" =~ ^[0-9]{6}$ ]]; then echo "No dev phone OTP returned. Ensure DEV_MODE=true and SMS_PROVIDER=dev."; exit 1; fi
curl -fsS -X POST "$API/account/phone/verify" -H "$AUTH" -H 'Content-Type: application/json' -d "{\"code\":\"$PHONE_CODE\"}" >/dev/null
IDENTITY=$(curl -fsS "$API/account/me" -H "$AUTH" | json_get "['identityVerified']")
if [ "$IDENTITY" != "True" ] && [ "$IDENTITY" != "true" ]; then echo "Identity verification did not complete"; exit 1; fi

echo "[7/10] Completing profile and preferences..."
curl -fsS -X PUT "$API/profile/me" -H "$AUTH" -H 'Content-Type: application/json' -d '{"displayName":"Smoke Test","dateOfBirth":"1998-05-10","gender":"MALE","heightCm":175,"maritalStatus":"Never Married","motherTongue":"Telugu","religion":"Hindu","community":"","country":"USA","state":"Texas","city":"Richardson","education":"MS Computer Science","occupation":"Software Engineer","incomeRange":"$80k-$120k","diet":"Non-Vegetarian","smoking":"No","drinking":"Occasionally","about":"Automated smoke-test profile.","profileCreatedBy":"SELF","visibility":"MEMBERS"}' >/dev/null
curl -fsS -X PUT "$API/preferences" -H "$AUTH" -H 'Content-Type: application/json' -d '{"minAge":24,"maxAge":32,"minHeightCm":150,"maxHeightCm":180,"country":"USA","state":"Texas","religion":"Hindu","motherTongue":"Telugu","education":"","occupation":"","diet":""}' >/dev/null

echo "[8/10] Checking recommendations/search..."
MATCHES=$(curl -fsS "$API/matches" -H "$AUTH")
COUNT=$(printf '%s' "$MATCHES" | python3 -c 'import sys,json; print(len(json.load(sys.stdin)))')
if [ "$COUNT" -lt 1 ]; then echo "Expected at least one demo match; found $COUNT"; exit 1; fi
SEARCH=$(curl -fsS "$API/profiles?country=USA&state=Texas" -H "$AUTH")
TOTAL=$(printf '%s' "$SEARCH" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("totalElements",0))')
if [ "$TOTAL" -lt 1 ]; then echo "Expected search results; found $TOTAL"; exit 1; fi

echo "[9/10] Checking verification badge data..."
PHONE_VERIFIED=$(curl -fsS "$API/account/me" -H "$AUTH" | json_get "['phoneVerified']")
if [ "$PHONE_VERIFIED" != "True" ] && [ "$PHONE_VERIFIED" != "true" ]; then echo "Expected phoneVerified=true"; exit 1; fi

echo "[10/10] Checking notifications endpoint..."
curl -fsS "$API/notifications" -H "$AUTH" >/dev/null

echo
printf 'SoulSync verification PASSED.\nBackend health: UP\nFrontend: reachable\nEmail OTP: passed\nPhone OTP: passed\nIdentity verified: true\nProfile + preferences: passed\nMatches: %s\nSearch results: %s\n' "$COUNT" "$TOTAL"
