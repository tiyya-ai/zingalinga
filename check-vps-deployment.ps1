# Check VPS Deployment Status
Write-Host "========================================" -ForegroundColor Blue
Write-Host "   🔍 VPS DEPLOYMENT STATUS CHECK" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Check local git status
Write-Host "📋 Local Repository Status:" -ForegroundColor Yellow
git status --porcelain
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Git repository is clean" -ForegroundColor Green
} else {
    Write-Host "⚠️ There are uncommitted changes" -ForegroundColor Yellow
}
Write-Host ""

# Get latest local commit
Write-Host "📊 Latest Local Commits:" -ForegroundColor Yellow
$localCommit = git rev-parse HEAD
Write-Host "Latest local commit: $localCommit" -ForegroundColor Cyan
git log --oneline -3
Write-Host ""

# Check if changes are pushed to GitHub
Write-Host "🔗 GitHub Sync Status:" -ForegroundColor Yellow
$remoteBehind = git rev-list HEAD..origin/main --count 2>$null
$remoteAhead = git rev-list origin/main..HEAD --count 2>$null

if ($remoteBehind -eq 0 -and $remoteAhead -eq 0) {
    Write-Host "✅ Local and GitHub are in sync" -ForegroundColor Green
} elseif ($remoteAhead -gt 0) {
    Write-Host "⚠️ You have $remoteAhead unpushed commits" -ForegroundColor Yellow
    Write-Host "Run: git push origin main" -ForegroundColor Cyan
} else {
    Write-Host "⚠️ Your local branch is behind GitHub" -ForegroundColor Yellow
    Write-Host "Run: git pull origin main" -ForegroundColor Cyan
}
Write-Host ""

# Check VPS status via SSH
Write-Host "🌐 Checking VPS Deployment:" -ForegroundColor Yellow
Write-Host "VPS URL: http://zingalinga.io" -ForegroundColor Cyan
Write-Host "VPS IP: 109.199.106.28" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔍 Manual Verification Steps:" -ForegroundColor Yellow
Write-Host "1. Visit: http://zingalinga.io" -ForegroundColor White
Write-Host "2. Check GitHub Actions: https://github.com/tiyya-ai/zingalinga/actions" -ForegroundColor White
Write-Host "3. Clear browser cache (Ctrl+F5) if changes not visible" -ForegroundColor White
Write-Host ""

Write-Host "🛠️ VPS Commands (if you have SSH access):" -ForegroundColor Yellow
Write-Host "ssh root@109.199.106.28" -ForegroundColor Cyan
Write-Host "cd /var/www/zinga-linga" -ForegroundColor Cyan
Write-Host "git log --oneline -3" -ForegroundColor Cyan
Write-Host "pm2 status" -ForegroundColor Cyan
Write-Host "pm2 logs zinga-linga --lines 20" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚡ Quick Troubleshooting:" -ForegroundColor Yellow
Write-Host "• If changes not visible: Wait 2-3 minutes for deployment" -ForegroundColor White
Write-Host "• Check GitHub Actions for deployment errors" -ForegroundColor White
Write-Host "• Verify PM2 process is running on VPS" -ForegroundColor White
Write-Host "• Clear browser cache completely" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")