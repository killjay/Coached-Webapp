# Seed Templates - One Command Script
# This script will seed templates and verify them automatically

Write-Host "🌱 Template Seeding Script" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""

# Check if serviceAccountKey.json exists
if (-not (Test-Path "scripts/serviceAccountKey.json")) {
    Write-Host "❌ Error: serviceAccountKey.json not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download your service account key from Firebase Console:" -ForegroundColor Yellow
    Write-Host "1. Go to Firebase Console → Project Settings → Service Accounts" -ForegroundColor Yellow
    Write-Host "2. Click 'Generate New Private Key'" -ForegroundColor Yellow
    Write-Host "3. Save the file as 'serviceAccountKey.json' in the scripts folder" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ Error: .env.local not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create a .env.local file with your Firebase configuration." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ Prerequisites check passed!" -ForegroundColor Green
Write-Host ""

# Step 1: Get coach ID (optional, informational only)
Write-Host "Step 1: Checking for existing coaches..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
node scripts/get-coach-id.js
Write-Host ""

# Step 2: Seed templates
Write-Host "Step 2: Seeding templates..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
node scripts/seed-templates.js

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Template seeding failed!" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host ""

# Step 3: Verify templates
Write-Host "Step 3: Verifying templates..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
node scripts/verify-templates.js

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ All done! Templates are ready to use!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open your app: http://localhost:5000" -ForegroundColor White
Write-Host "2. Navigate to the Templates page" -ForegroundColor White
Write-Host "3. Toggle between 'View Published' and 'View Drafts'" -ForegroundColor White
Write-Host ""
