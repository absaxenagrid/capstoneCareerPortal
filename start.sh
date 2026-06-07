#!/bin/bash
# ─────────────────────────────────────────────────────────
#  Forge Careers – Start Everything
#  Usage:  ./start.sh          (build + start)
#          ./start.sh --no-build  (start without rebuilding)
#          ./start.sh --stop    (stop everything)
#          ./start.sh --clean   (stop + remove volumes)
# ─────────────────────────────────────────────────────────

set -e

COMPOSE="docker-compose"

# Detect docker compose v2
if docker compose version &>/dev/null 2>&1; then
  COMPOSE="docker compose"
fi

case "${1:-}" in
  --stop)
    echo "🛑 Stopping Forge Careers..."
    $COMPOSE down
    echo "✅ Stopped."
    exit 0
    ;;
  --clean)
    echo "🧹 Stopping and removing all volumes..."
    $COMPOSE down -v
    echo "✅ Cleaned."
    exit 0
    ;;
  --no-build)
    echo "🚀 Starting Forge Careers (no rebuild)..."
    $COMPOSE up -d
    ;;
  *)
    echo ""
    echo "╔══════════════════════════════════════════╗"
    echo "║      FORGE CAREERS – Starting Up...      ║"
    echo "╚══════════════════════════════════════════╝"
    echo ""
    echo "📦 Building and starting all services..."
    echo "   This takes ~3-5 minutes on first run."
    echo ""
    $COMPOSE up --build -d
    ;;
esac

echo ""
echo "⏳ Waiting for services to become healthy..."

# Wait for frontend to be accessible
MAX=120
COUNT=0
while ! curl -sf http://localhost:3000 > /dev/null 2>&1; do
  sleep 3
  COUNT=$((COUNT+3))
  if [ $COUNT -ge $MAX ]; then
    echo ""
    echo "⚠️  Timeout waiting for frontend. Check logs: docker-compose logs -f"
    break
  fi
  echo -n "."
done

echo ""
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                  ✅  FORGE CAREERS READY                 ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  🌐 Frontend         → http://localhost:3000             ║"
echo "║  🔀 API Gateway      → http://localhost:8080             ║"
echo "║  👤 Candidate API    → http://localhost:8081/swagger-ui  ║"
echo "║  📋 Application API  → http://localhost:8082/swagger-ui  ║"
echo "║  📁 File API         → http://localhost:8083/swagger-ui  ║"
echo "║  🎯 Eureka Dashboard → http://localhost:8761             ║"
echo "║  🪣 MinIO Console    → http://localhost:9001             ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  MinIO login: minioadmin / minioadmin123                 ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  Stop:  ./start.sh --stop                                ║"
echo "║  Logs:  docker-compose logs -f [service-name]            ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Seed a test candidate if none exists
echo "🌱 Seeding test candidate (candidateId=1)..."
sleep 5
curl -sf -X POST http://localhost:8080/api/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alex",
    "lastName": "Sterling",
    "email": "alex.sterling@forge.dev",
    "phoneNumber": "+1-555-892-0441"
  }' > /dev/null 2>&1 && echo "   ✅ Test candidate created (alex.sterling@forge.dev)" \
  || echo "   ℹ️  Candidate may already exist — skipping seed."

echo ""
echo "Open http://localhost:3000 in your browser. 🚀"
echo ""
