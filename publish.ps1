# Usage: Right-click -> Run with PowerShell (or run from terminal in this folder)
# This script stages all changes, commits with a timestamped message, and pushes to the 'main' branch.

param(
  [string]$Message = "chore: autosave"
)

function Ensure-Git {
  try {
    $v = git --version 2>$null
    if (-not $LASTEXITCODE -eq 0 -and -not $v) { throw "git not found" }
  } catch {
    Write-Error "Git is not available in PATH. Please install Git for Windows and restart your terminal."
    exit 1
  }
}

function Get-Branch {
  $branch = git rev-parse --abbrev-ref HEAD 2>$null
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($branch)) { return "main" }
  return $branch.Trim()
}

Ensure-Git

# Ensure repository exists
if (-not (Test-Path -Path ".git")) {
  git init | Out-Null
}

$branch = Get-Branch

# Stage and commit
$ts = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$fullMsg = "$Message ($ts)"

# Avoid empty commits
$changes = git status --porcelain
if ([string]::IsNullOrWhiteSpace($changes)) {
  Write-Host "No changes to commit."
} else {
  git add .
  git commit -m $fullMsg
}

# Ensure main branch name
if ($branch -ne "main") {
  try { git branch -M main } catch {}
}

# Push (assumes 'origin' is set)
try {
  git push -u origin main
} catch {
  Write-Warning "Push failed. Make sure 'origin' remote exists and you have access. To set it:"
  Write-Host "  git remote add origin https://github.com/RRPsystem/windsurfer.git"
  Write-Host "Then run this script again."
}
