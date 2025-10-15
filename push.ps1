# Simpel push script - altijd naar main
# Gebruik: .\push.ps1 "jouw commit bericht"

param(
    [string]$Message = "update"
)

Write-Host "🔄 Schakel naar main..." -ForegroundColor Cyan
git checkout main

Write-Host "📥 Haal laatste wijzigingen op..." -ForegroundColor Cyan
git pull origin main

Write-Host "➕ Voeg alle wijzigingen toe..." -ForegroundColor Cyan
git add -A

Write-Host "💾 Commit met bericht: $Message" -ForegroundColor Cyan
git commit -m $Message

Write-Host "📤 Push naar main..." -ForegroundColor Cyan
git push origin main

Write-Host "✅ Klaar!" -ForegroundColor Green
