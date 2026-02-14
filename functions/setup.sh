#!/bin/bash

# Setup script for Cloud Functions

echo "Setting up Cloud Functions for Coached..."

# Navigate to functions directory
cd functions

# Install dependencies
echo "Installing dependencies..."
npm install

# Build TypeScript
echo "Building TypeScript..."
npm run build

echo ""
echo "✓ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure email settings:"
echo "   firebase functions:config:set email.user=\"your-email@gmail.com\" email.pass=\"your-app-password\""
echo ""
echo "2. Deploy functions:"
echo "   npm run deploy"
echo "   or from project root: firebase deploy --only functions"
echo ""
echo "See functions/README.md for detailed instructions."
