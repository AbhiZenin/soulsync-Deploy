#!/usr/bin/env bash
set -u
cd "$(dirname "$0")/.."

echo "1) Containers"
docker compose ps

echo
echo "2) Backend health"
curl -sS -i --max-time 5 http://localhost:8080/actuator/health

echo
echo "3) Demo account in database"
docker compose exec -T postgres psql -U soulsync -d soulsync -c \
  "select email, email_verified, status, role from users where email='ananya@soulsync.dev';"

echo
echo "4) Direct backend login"
curl -sS -i --max-time 8 -H 'Content-Type: application/json' \
  -d '{"email":"ananya@soulsync.dev","password":"Password123!"}' \
  http://localhost:8080/api/v1/auth/login

echo
echo "5) Same-origin login through frontend proxy"
curl -sS -i --max-time 8 -H 'Content-Type: application/json' \
  -d '{"email":"ananya@soulsync.dev","password":"Password123!"}' \
  http://localhost:3000/api/v1/auth/login
