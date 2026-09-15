#!/usr/bin/env bash
set -u
cd "$(dirname "$0")/.."

echo "== SoulSync containers =="
docker compose ps || true

echo
echo "== Backend health (direct) =="
curl -sS -i --max-time 5 http://localhost:8080/actuator/health || true

echo
echo "== Frontend =="
curl -sS -I --max-time 5 http://localhost:3000 | head -n 1 || true

echo
echo "== Demo users in PostgreSQL =="
docker compose exec -T postgres psql -U soulsync -d soulsync -c "select email, email_verified, status, role from users where email like '%@soulsync.dev' order by email;" || true

echo
echo "== Direct backend login =="
curl -sS -i --max-time 8 \
  -H 'Content-Type: application/json' \
  -d '{"email":"ananya@soulsync.dev","password":"Password123!"}' \
  http://localhost:8080/api/v1/auth/login || true

echo
echo "== Browser-path login through Next.js proxy =="
curl -sS -i --max-time 8 \
  -H 'Content-Type: application/json' \
  -d '{"email":"ananya@soulsync.dev","password":"Password123!"}' \
  http://localhost:3000/api/v1/auth/login || true

echo
echo "== Recent backend logs =="
docker compose logs --tail=60 backend || true
