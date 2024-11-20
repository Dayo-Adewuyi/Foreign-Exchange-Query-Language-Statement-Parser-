#!/bin/bash
set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🚀 Starting database migration process..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    exit 1
fi

# Source environment variables
source .env

# Build the project first
echo "📦 Building project..."
npm run build

# Run pending migrations
echo "🔄 Running database migrations..."
npm run migration:run

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migrations completed successfully!${NC}"
else
    echo -e "${RED}❌ Migration failed!${NC}"
    exit 1
fi

# Show migration status
echo "📊 Current migration status:"
npm run migration:show