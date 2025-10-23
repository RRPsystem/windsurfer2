# Deploy Script voor Website Builder
# Dit script pushed naar GitHub en triggert een deploy

Write-Host "🚀 Starting deployment..." -ForegroundColor Cyan

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "⚠️  Uncommitted changes found. Committing..." -ForegroundColor Yellow
    git add .
    $commitMsg = Read-Host "Enter commit message (or press Enter for default)"
    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
        $commitMsg = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    }
    git commit -m $commitMsg
}

# Push to GitHub
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 Check deployment status:" -ForegroundColor Cyan
    Write-Host "   https://github.com/RRPsystem/windsurfer2/actions" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 Production URL:" -ForegroundColor Cyan
    Write-Host "   https://www.ai-websitestudio.nl" -ForegroundColor White
    Write-Host ""
    Write-Host "⏱️  Deployment usually takes 1-2 minutes" -ForegroundColor Yellow
} else {
    Write-Host "❌ Push failed! Check errors above." -ForegroundColor Red
    exit 1
}
