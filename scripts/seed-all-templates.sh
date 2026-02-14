#!/bin/bash

# Seed Templates - One Command Script
# This script will seed templates and verify them automatically

echo "🌱 Template Seeding Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if serviceAccountKey.json exists
if [ ! -f "scripts/serviceAccountKey.json" ]; then
    echo "❌ Error: serviceAccountKey.json not found!"
    echo ""
    echo "Please download your service account key from Firebase Console:"
    echo "1. Go to Firebase Console → Project Settings → Service Accounts"
    echo "2. Click 'Generate New Private Key'"
    echo "3. Save the file as 'serviceAccountKey.json' in the scripts folder"
    echo ""
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local not found!"
    echo ""
    echo "Please create a .env.local file with your Firebase configuration."
    echo ""
    exit 1
fi

echo "✅ Prerequisites check passed!"
echo ""

# Step 1: Get coach ID (optional, informational only)
echo "Step 1: Checking for existing coaches..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
node scripts/get-coach-id.js
echo ""

# Step 2: Seed templates
echo "Step 2: Seeding templates..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
node scripts/seed-templates.js

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Template seeding failed!"
    echo ""
    exit 1
fi

echo ""

# Step 3: Verify templates
echo "Step 3: Verifying templates..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
node scripts/verify-templates.js

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All done! Templates are ready to use!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Open your app: http://localhost:5000"
echo "2. Navigate to the Templates page"
echo "3. Toggle between 'View Published' and 'View Drafts'"
echo ""
