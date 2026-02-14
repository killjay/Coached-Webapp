# Setup script for Cloud Functions

Write-Host "Setting up Cloud Functions for Coached..." -ForegroundColor Cyan

# Navigate to functions directory
Set-Location functions

# Install dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
npm install

# Build TypeScript
Write-Host "`nBuilding TypeScript..." -ForegroundColor Yellow
npm run build

Write-Host "`n✓ Setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Configure email settings:"
Write-Host '   firebase functions:config:set email.user="your-email@gmail.com" email.pass="your-app-password"' -ForegroundColor White
Write-Host "`n2. Deploy functions:"
Write-Host "   npm run deploy" -ForegroundColor White
Write-Host "   or from project root: firebase deploy --only functions" -ForegroundColor White
Write-Host "`nSee functions/README.md for detailed instructions." -ForegroundColor Gray
