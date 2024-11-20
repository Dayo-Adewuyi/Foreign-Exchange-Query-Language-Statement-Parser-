{
  "FXQL": "USD-GBP {\n BUY 0.85\n SELL 0.90\n CAP 10000\n}\n\nEUR-USD {\n BUY 1.05\n SELL 1.10\n CAP 15000\n}\n\nGBP-EUR {\n BUY 1.15\n SELL 1.20\n CAP 12000\n}\n\nJPY-USD {\n BUY 0.0067\n SELL 0.0070\n CAP 1000000\n}\n\nEUR-GBP {\n BUY 0.85\n SELL 0.88\n CAP 20000\n}"
}

// scripts/seed-data.sh
#!/bin/bash
set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🌱 Starting database seeding process..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    exit 1
fi

# Source environment variables
source .env

# Function to seed data using curl
seed_data() {
    echo -e "${BLUE}🔄 Seeding currency pairs...${NC}"
    
    # Make API call to seed data using the JSON file
    RESPONSE=$(curl -s -X POST "http://localhost:${PORT}/fxql-statements" \
        -H "Content-Type: application/json" \
        -d @scripts/seed-data.json)
    
    # Check if seeding was successful
    if echo "$RESPONSE" | grep -q "FXQL-200"; then
        echo -e "${GREEN}✅ Data seeded successfully!${NC}"
    else
        echo -e "${RED}❌ Seeding failed! Response:${NC}"
        echo "$RESPONSE"
        exit 1
    fi
}

# Check if application is running
check_app() {
    echo "🔍 Checking if application is running..."
    if curl -s "http://localhost:${PORT}/api/docs" > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Main execution
if check_app; then
    seed_data
else
    echo -e "${RED}❌ Application is not running on port ${PORT}${NC}"
    echo "Please start the application first with: npm run start:dev"
    exit 1
fi

echo -e "${GREEN}✨ Seeding process completed!${NC}"