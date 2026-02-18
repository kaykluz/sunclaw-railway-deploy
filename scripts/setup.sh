#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
# SunClaw — Self-Hosted Installer
# One-line install: curl -fsSL https://raw.githubusercontent.com/kaykluz/sunclaw/main/scripts/setup.sh | bash
#
# Supports: Ubuntu 20.04+, Debian 11+, CentOS 8+, RHEL 8+, macOS 12+
# Installs: Docker, Docker Compose, Git, SunClaw
# ─────────────────────────────────────────────────────────────────────
set -euo pipefail

# ─── Colors ───
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

log()   { echo -e "${GREEN}[SunClaw]${NC} $1"; }
warn()  { echo -e "${YELLOW}[SunClaw]${NC} $1"; }
error() { echo -e "${RED}[SunClaw]${NC} $1"; }
header(){ echo -e "\n${CYAN}${BOLD}═══ $1 ═══${NC}\n"; }

# ─── Banner ───
echo ""
echo -e "${CYAN}${BOLD}"
echo "  ███████╗██╗   ██╗███╗   ██╗ ██████╗██╗      █████╗ ██╗    ██╗"
echo "  ██╔════╝██║   ██║████╗  ██║██╔════╝██║     ██╔══██╗██║    ██║"
echo "  ███████╗██║   ██║██╔██╗ ██║██║     ██║     ███████║██║ █╗ ██║"
echo "  ╚════██║██║   ██║██║╚██╗██║██║     ██║     ██╔══██║██║███╗██║"
echo "  ███████║╚██████╔╝██║ ╚████║╚██████╗███████╗██║  ██║╚███╔███╔╝"
echo "  ╚══════╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝"
echo -e "${NC}"
echo -e "  ${BOLD}The AI Agent for Renewable Energy${NC}"
echo -e "  Powered by OpenClaw"
echo ""

# ─── Detect OS ───
header "Detecting System"

OS="unknown"
DISTRO="unknown"
PKG_MGR="unknown"

if [[ "$OSTYPE" == "darwin"* ]]; then
  OS="macos"
  DISTRO="macos"
  PKG_MGR="brew"
  log "Detected: macOS $(sw_vers -productVersion 2>/dev/null || echo 'unknown')"
elif [[ -f /etc/os-release ]]; then
  . /etc/os-release
  OS="linux"
  DISTRO="${ID:-unknown}"
  case "$DISTRO" in
    ubuntu|debian|linuxmint|pop)
      PKG_MGR="apt"
      ;;
    centos|rhel|rocky|almalinux|fedora)
      PKG_MGR="yum"
      if command -v dnf &>/dev/null; then
        PKG_MGR="dnf"
      fi
      ;;
    *)
      warn "Unsupported distribution: $DISTRO. Will attempt generic install."
      ;;
  esac
  log "Detected: $PRETTY_NAME"
else
  error "Cannot detect operating system. Exiting."
  exit 1
fi

# ─── Check root / sudo ───
SUDO=""
if [[ "$EUID" -ne 0 ]]; then
  if command -v sudo &>/dev/null; then
    SUDO="sudo"
    log "Running as non-root, will use sudo for system commands."
  else
    warn "Not running as root and sudo is not available. Some installs may fail."
  fi
fi

# ─── Install Docker ───
header "Checking Docker"

install_docker_linux() {
  if command -v docker &>/dev/null; then
    log "Docker is already installed: $(docker --version)"
    return
  fi

  log "Installing Docker..."
  if [[ "$PKG_MGR" == "apt" ]]; then
    $SUDO apt-get update -qq
    $SUDO apt-get install -y -qq ca-certificates curl gnupg lsb-release
    $SUDO install -m 0755 -d /etc/apt/keyrings
    curl -fsSL "https://download.docker.com/linux/${DISTRO}/gpg" | $SUDO gpg --dearmor -o /etc/apt/keyrings/docker.gpg 2>/dev/null || true
    $SUDO chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${DISTRO} $(lsb_release -cs) stable" | $SUDO tee /etc/apt/sources.list.d/docker.list > /dev/null
    $SUDO apt-get update -qq
    $SUDO apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  elif [[ "$PKG_MGR" == "yum" || "$PKG_MGR" == "dnf" ]]; then
    $SUDO $PKG_MGR install -y yum-utils 2>/dev/null || true
    $SUDO yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo 2>/dev/null || true
    $SUDO $PKG_MGR install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  else
    # Fallback: use Docker's convenience script
    curl -fsSL https://get.docker.com | $SUDO sh
  fi

  $SUDO systemctl enable docker 2>/dev/null || true
  $SUDO systemctl start docker 2>/dev/null || true

  # Add current user to docker group
  if [[ "$EUID" -ne 0 ]]; then
    $SUDO usermod -aG docker "$USER" 2>/dev/null || true
    warn "Added $USER to docker group. You may need to log out and back in."
  fi

  log "Docker installed: $(docker --version)"
}

install_docker_macos() {
  if command -v docker &>/dev/null; then
    log "Docker is already installed: $(docker --version)"
    return
  fi

  if ! command -v brew &>/dev/null; then
    error "Homebrew is required on macOS. Install it first: https://brew.sh"
    exit 1
  fi

  log "Installing Docker Desktop via Homebrew..."
  brew install --cask docker
  warn "Docker Desktop installed. Please open Docker Desktop from Applications to complete setup."
  warn "Then re-run this script."
  exit 0
}

if [[ "$OS" == "linux" ]]; then
  install_docker_linux
elif [[ "$OS" == "macos" ]]; then
  install_docker_macos
fi

# ─── Install Git ───
header "Checking Git"

if command -v git &>/dev/null; then
  log "Git is already installed: $(git --version)"
else
  log "Installing Git..."
  if [[ "$PKG_MGR" == "apt" ]]; then
    $SUDO apt-get install -y -qq git
  elif [[ "$PKG_MGR" == "yum" || "$PKG_MGR" == "dnf" ]]; then
    $SUDO $PKG_MGR install -y git
  elif [[ "$PKG_MGR" == "brew" ]]; then
    brew install git
  fi
  log "Git installed: $(git --version)"
fi

# ─── Clone SunClaw ───
header "Setting Up SunClaw"

INSTALL_DIR="${SUNCLAW_DIR:-$HOME/sunclaw}"

if [[ -d "$INSTALL_DIR" ]]; then
  warn "SunClaw directory already exists at $INSTALL_DIR"
  log "Pulling latest changes..."
  cd "$INSTALL_DIR"
  git pull origin main 2>/dev/null || warn "Could not pull latest. Continuing with existing files."
else
  log "Cloning SunClaw to $INSTALL_DIR..."
  git clone https://github.com/kaykluz/sunclaw.git "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

# ─── Configuration ───
header "Configuration"

ENV_FILE="$INSTALL_DIR/.env"

if [[ -f "$ENV_FILE" ]]; then
  warn "Existing .env file found. Keeping current configuration."
  log "To reconfigure, edit: $ENV_FILE"
else
  log "Creating configuration file..."

  # Interactive configuration
  echo ""
  echo -e "${BOLD}Let's configure your SunClaw instance.${NC}"
  echo ""

  # LLM Provider
  echo -e "Which AI provider do you want to use?"
  echo "  1) OpenAI (GPT-4, GPT-3.5)"
  echo "  2) Anthropic (Claude)"
  echo "  3) Google (Gemini)"
  echo "  4) OpenRouter (multiple models)"
  echo "  5) Venice AI"
  echo "  6) xAI (Grok)"
  echo "  7) Ollama (local, free)"
  echo ""
  read -rp "Choose [1-7, default: 1]: " provider_choice
  provider_choice="${provider_choice:-1}"

  case "$provider_choice" in
    1) LLM_PROVIDER="openai"; LLM_MODEL="gpt-4o"; API_KEY_NAME="OPENAI_API_KEY" ;;
    2) LLM_PROVIDER="anthropic"; LLM_MODEL="claude-sonnet-4-20250514"; API_KEY_NAME="ANTHROPIC_API_KEY" ;;
    3) LLM_PROVIDER="google"; LLM_MODEL="gemini-2.0-flash"; API_KEY_NAME="GOOGLE_API_KEY" ;;
    4) LLM_PROVIDER="openrouter"; LLM_MODEL="openai/gpt-4o"; API_KEY_NAME="OPENROUTER_API_KEY" ;;
    5) LLM_PROVIDER="venice"; LLM_MODEL="llama-3.3-70b"; API_KEY_NAME="VENICE_API_KEY" ;;
    6) LLM_PROVIDER="xai"; LLM_MODEL="grok-3"; API_KEY_NAME="XAI_API_KEY" ;;
    7) LLM_PROVIDER="ollama"; LLM_MODEL="llama3.2"; API_KEY_NAME="" ;;
    *) LLM_PROVIDER="openai"; LLM_MODEL="gpt-4o"; API_KEY_NAME="OPENAI_API_KEY" ;;
  esac

  API_KEY=""
  if [[ -n "$API_KEY_NAME" ]]; then
    echo ""
    read -rsp "Enter your $API_KEY_NAME: " API_KEY
    echo ""
  fi

  # Instance name
  echo ""
  read -rp "Instance name [default: my-sunclaw]: " INSTANCE_NAME
  INSTANCE_NAME="${INSTANCE_NAME:-my-sunclaw}"

  # Channels
  echo ""
  echo -e "${BOLD}Channel Configuration (press Enter to skip)${NC}"

  read -rp "Telegram Bot Token (optional): " TELEGRAM_TOKEN
  read -rp "Slack Bot Token (optional): " SLACK_TOKEN
  read -rp "Discord Bot Token (optional): " DISCORD_TOKEN

  # KIISHA
  echo ""
  read -rp "KIISHA API URL (optional, for enterprise): " KIISHA_URL
  KIISHA_KEY=""
  if [[ -n "$KIISHA_URL" ]]; then
    read -rsp "KIISHA API Key: " KIISHA_KEY
    echo ""
  fi

  # Write .env
  cat > "$ENV_FILE" << ENVEOF
# SunClaw Configuration — Generated by setup.sh
# $(date -u +"%Y-%m-%d %H:%M:%S UTC")

# ─── AI Provider ───
LLM_PROVIDER=${LLM_PROVIDER}
LLM_MODEL=${LLM_MODEL}
${API_KEY_NAME:+${API_KEY_NAME}=${API_KEY}}

# ─── Instance ───
INSTANCE_NAME=${INSTANCE_NAME}
GATEWAY_PORT=3000
DASHBOARD_PORT=3001

# ─── Channels ───
TELEGRAM_ENABLED=${TELEGRAM_TOKEN:+true}${TELEGRAM_TOKEN:-false}
${TELEGRAM_TOKEN:+TELEGRAM_BOT_TOKEN=${TELEGRAM_TOKEN}}
SLACK_ENABLED=${SLACK_TOKEN:+true}${SLACK_TOKEN:-false}
${SLACK_TOKEN:+SLACK_BOT_TOKEN=${SLACK_TOKEN}}
DISCORD_ENABLED=${DISCORD_TOKEN:+true}${DISCORD_TOKEN:-false}
${DISCORD_TOKEN:+DISCORD_BOT_TOKEN=${DISCORD_TOKEN}}

# ─── KIISHA Enterprise ───
KIISHA_ENABLED=${KIISHA_URL:+true}${KIISHA_URL:-false}
${KIISHA_URL:+KIISHA_API_URL=${KIISHA_URL}}
${KIISHA_KEY:+KIISHA_API_KEY=${KIISHA_KEY}}
ENVEOF

  log "Configuration saved to $ENV_FILE"
fi

# ─── Docker Compose ───
header "Starting SunClaw"

# Check if docker-compose.yml exists
if [[ ! -f "$INSTALL_DIR/docker-compose.yml" ]]; then
  warn "No docker-compose.yml found. Creating default configuration..."

  cat > "$INSTALL_DIR/docker-compose.yml" << 'DCEOF'
version: "3.8"

services:
  gateway:
    image: ghcr.io/kaykluz/sunclaw-gateway:latest
    container_name: sunclaw-gateway
    restart: unless-stopped
    ports:
      - "${GATEWAY_PORT:-3000}:3000"
    env_file:
      - .env
    volumes:
      - gateway-data:/app/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  dashboard:
    image: ghcr.io/kaykluz/sunclaw-dashboard:latest
    container_name: sunclaw-dashboard
    restart: unless-stopped
    ports:
      - "${DASHBOARD_PORT:-3001}:3001"
    env_file:
      - .env
    depends_on:
      gateway:
        condition: service_healthy

volumes:
  gateway-data:
DCEOF
fi

# Start services
log "Pulling Docker images..."
docker compose pull 2>/dev/null || $SUDO docker compose pull 2>/dev/null || {
  # Fallback to docker-compose v1
  docker-compose pull 2>/dev/null || $SUDO docker-compose pull 2>/dev/null || {
    warn "Could not pull images. They will be pulled on first start."
  }
}

log "Starting SunClaw services..."
docker compose up -d 2>/dev/null || $SUDO docker compose up -d 2>/dev/null || {
  docker-compose up -d 2>/dev/null || $SUDO docker-compose up -d 2>/dev/null || {
    error "Failed to start Docker services. Please check Docker is running."
    exit 1
  }
}

# ─── Health Check ───
header "Health Check"

log "Waiting for services to start..."
sleep 5

GATEWAY_PORT="${GATEWAY_PORT:-3000}"
DASHBOARD_PORT="${DASHBOARD_PORT:-3001}"

# Check gateway
if curl -sf "http://localhost:${GATEWAY_PORT}/health" > /dev/null 2>&1; then
  log "Gateway is running on port ${GATEWAY_PORT} ✓"
else
  warn "Gateway is still starting. It may take a minute."
fi

# Check dashboard
if curl -sf "http://localhost:${DASHBOARD_PORT}" > /dev/null 2>&1; then
  log "Dashboard is running on port ${DASHBOARD_PORT} ✓"
else
  warn "Dashboard is still starting. It may take a minute."
fi

# ─── Firewall ───
if command -v ufw &>/dev/null; then
  log "Opening firewall ports..."
  $SUDO ufw allow "${GATEWAY_PORT}/tcp" 2>/dev/null || true
  $SUDO ufw allow "${DASHBOARD_PORT}/tcp" 2>/dev/null || true
fi

# ─── Done ───
header "SunClaw is Ready!"

SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "your-server-ip")

echo ""
echo -e "  ${BOLD}Gateway:${NC}    http://${SERVER_IP}:${GATEWAY_PORT}"
echo -e "  ${BOLD}Dashboard:${NC}  http://${SERVER_IP}:${DASHBOARD_PORT}"
echo ""
echo -e "  ${BOLD}Configuration:${NC}  ${ENV_FILE}"
echo -e "  ${BOLD}Install Dir:${NC}    ${INSTALL_DIR}"
echo ""
echo -e "  ${BOLD}Useful commands:${NC}"
echo -e "    cd ${INSTALL_DIR}"
echo -e "    docker compose logs -f       # View logs"
echo -e "    docker compose restart        # Restart services"
echo -e "    docker compose down           # Stop services"
echo -e "    docker compose pull && docker compose up -d  # Update"
echo ""
echo -e "  ${GREEN}${BOLD}SunClaw is live! 🌞${NC}"
echo ""
