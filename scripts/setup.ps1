# Coach Profiles Seeding - Quick Setup

Write-Host "🏋️ Coach Profiles Seeding Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if node is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js is installed" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install firebase-admin dotenv --save-dev

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Download your Firebase service account key:" -ForegroundColor White
Write-Host "   - Go to: https://console.firebase.google.com" -ForegroundColor Gray
Write-Host "   - Select your project" -ForegroundColor Gray
Write-Host "   - Go to Project Settings > Service Accounts" -ForegroundColor Gray
Write-Host "   - Click 'Generate New Private Key'" -ForegroundColor Gray
Write-Host "   - Save as: scripts\serviceAccountKey.json" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Ensure your .env file is configured with Firebase credentials" -ForegroundColor White
Write-Host ""
Write-Host "3. Run the seeding script:" -ForegroundColor White
Write-Host "   npm run seed:coaches" -ForegroundColor Yellow
Write-Host ""
Write-Host "For detailed instructions, see: scripts\README.md" -ForegroundColor White
Write-Host ""
