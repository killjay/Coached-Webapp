#!/bin/bash

echo "🏋️ Coach Profiles Seeding Setup"
echo "================================"
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js is installed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install firebase-admin dotenv --save-dev

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "📋 Next Steps:"
echo "1. Download your Firebase service account key:"
echo "   - Go to: https://console.firebase.google.com"
echo "   - Select your project"
echo "   - Go to Project Settings > Service Accounts"
echo "   - Click 'Generate New Private Key'"
echo "   - Save as: scripts/serviceAccountKey.json"
echo ""
echo "2. Ensure your .env file is configured with Firebase credentials"
echo ""
echo "3. Run the seeding script:"
echo "   npm run seed:coaches"
echo ""
echo "For detailed instructions, see: scripts/README.md"
echo ""
