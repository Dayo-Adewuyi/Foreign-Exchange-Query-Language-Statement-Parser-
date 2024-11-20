#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Function to print status
print_status() {
    echo -e "${GREEN}=>${NC} $1"
}

# Function to print error
print_error() {
    echo -e "${RED}Error:${NC} $1"
    exit 1
}

# Check Docker
print_status "Checking Docker installation..."
if ! command -v docker >/dev/null 2>&1; then
    print_error "Docker is not installed!"
fi

if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running!"
fi

# Check Docker Compose
print_status "Checking Docker Compose installation..."
if ! command -v docker-compose >/dev/null 2>&1; then
    print_error "Docker Compose is not installed!"
fi

# Clone repository
print_status "Cloning repository..."
git clone https://github.com/Dayo-Adewuyi/Foreign-Exchange-Query-Language-Statement-Parser-.git fxql-parser
cd fxql-parser

# Setup environment
print_status "Setting up environment..."
if [ ! -f ".env.example" ]; then
    print_error ".env.example file not found!"
fi

cp .env.example .env

# Check port availability
print_status "Checking port availability..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    print_error "Port 3000 is already in use!"
fi

# Start services
print_status "Starting services..."
docker-compose up -d --build

# Wait for services
print_status "Waiting for services to be healthy..."
timeout 30 bash -c 'until docker-compose ps | grep "healthy" | wc -l | grep -q "3"; do sleep 1; done' || {
    print_error "Services failed to become healthy within timeout!"
}

print_status "Setup completed successfully!"
print_status "API is running at http://localhost:3000"
print_status "API documentation is available at http://localhost:3000/api/docs"

# Show logs
print_status "Showing application logs (Ctrl+C to exit)..."
docker-compose logs -f api