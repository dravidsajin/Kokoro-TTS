#!/usr/bin/env bash

# ==============================================================================
# Kokoro TTS Studio — Concurrent Service Runner
# Starts both the Node.js TypeScript Backend and Next.js Frontend simultaneously
# ==============================================================================

set -e

# Resolve project root directory regardless of invocation location
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Terminal Color Codes
BOLD='\033[1m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BOLD}${MAGENTA}====================================================${NC}"
echo -e "${BOLD}${CYAN}🎙️  Vocalis AI Studio — Launching Full-Stack Services${NC}"
echo -e "${BOLD}${MAGENTA}====================================================${NC}"

# Check for Node.js
if ! command -v node >/dev/null 2>&1; then
  echo -e "${RED}Error: Node.js is not installed or not in PATH.${NC}"
  exit 1
fi

# Cleanup any existing processes on ports 5001 and 3000
cleanup_port() {
  local port=$1
  local pids=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo -e "${YELLOW}Freeing port $port (killing PID: $pids)...${NC}"
    kill -9 $pids 2>/dev/null || true
    sleep 0.5
  fi
}

cleanup_port 5001
cleanup_port 3000

# Cleanup handler for graceful shutdown on Ctrl+C (SIGINT / SIGTERM)
cleanup() {
  echo -e "\n${YELLOW}Shutting down Vocalis AI services...${NC}"
  
  if [ -n "$BACKEND_PID" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  
  if [ -n "$FRONTEND_PID" ]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi

  wait "$BACKEND_PID" 2>/dev/null || true
  wait "$FRONTEND_PID" 2>/dev/null || true

  # Ensure ports are free
  cleanup_port 5001
  cleanup_port 3000

  echo -e "${GREEN}✓ All services stopped safely.${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 1. Start Node.js TypeScript Backend (Port 5001)
echo -e "${MAGENTA}🚀 [1/2] Starting Node.js TypeScript Backend on port 5001...${NC}"
(
  cd "$PROJECT_ROOT/backend"
  npm run dev
) &
BACKEND_PID=$!

# Wait briefly for backend port to initialize
sleep 1.5

# 2. Start Next.js Frontend (Port 3000)
echo -e "${CYAN}✨ [2/2] Starting Next.js Frontend on port 3000...${NC}"
(
  cd "$PROJECT_ROOT/frontend"
  npm run dev
) &
FRONTEND_PID=$!

echo -e "\n${BOLD}${GREEN}====================================================${NC}"
echo -e "${BOLD}${GREEN}✓ Services are now launching concurrently!${NC}"
echo -e "   • ${CYAN}Frontend UI:${NC}    http://localhost:3000"
echo -e "   • ${MAGENTA}Backend API:${NC}    http://localhost:5001"
echo -e "   • ${MAGENTA}Health Check:${NC}   http://localhost:5001/api/health"
echo -e "   • ${MAGENTA}Voice Catalog:${NC}  http://localhost:5001/api/voices"
echo -e "${BOLD}${GREEN}====================================================${NC}"
echo -e "${YELLOW}Press [Ctrl + C] anytime to stop both services.${NC}\n"

# Wait for both background processes
wait "$BACKEND_PID" "$FRONTEND_PID"
