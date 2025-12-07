#!/bin/bash

# AITWY Installation Script
# This script helps you set up the AITWY application

echo "🚀 AITWY Installation Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ server/package.json not found${NC}"
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo ""

# Check if .env exists in server directory
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  server/.env not found${NC}"
    echo "Creating from .env.example..."
    
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created server/.env from .env.example${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  IMPORTANT: You MUST edit server/.env and add your MongoDB credentials!${NC}"
        echo "Replace <db_username> and <db_password> with your actual MongoDB Atlas credentials"
        echo ""
    else
        echo -e "${RED}❌ .env.example not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ server/.env already exists${NC}"
fi

cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found in root directory${NC}"
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
echo ""

# Check if .env exists in root directory
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env not found in root directory${NC}"
    echo "Creating .env file..."
    
    cat > .env << 'EOF'
# Backend API URL
VITE_API_URL=http://localhost:5000/api
EOF
    
    echo -e "${GREEN}✅ Created .env file${NC}"
else
    echo -e "${GREEN}✅ .env already exists${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo "================================"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Configure MongoDB Atlas:"
echo "   - Go to https://mongodb.com/cloud/atlas"
echo "   - Create a cluster and database user"
echo "   - Get your connection string"
echo ""
echo "2. Update server/.env with your MongoDB credentials:"
echo "   - Edit server/.env"
echo "   - Replace <db_username> and <db_password> with your actual credentials"
echo ""
echo "3. Start the backend server (Terminal 1):"
echo "   cd server"
echo "   npm run dev"
echo ""
echo "4. Start the frontend (Terminal 2):"
echo "   npm run dev"
echo ""
echo "5. Open http://localhost:8080 in your browser"
echo ""
echo "📚 Documentation:"
echo "   - QUICKSTART.md - Quick setup guide"
echo "   - CONFIGURATION.md - Detailed configuration"
echo "   - SETUP.md - Complete setup instructions"
echo ""
echo -e "${YELLOW}⚠️  Don't forget to configure MongoDB Atlas and update server/.env!${NC}"
echo ""

