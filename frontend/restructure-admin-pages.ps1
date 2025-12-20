# Script to restructure admin pages for nested routes
# Run this script from the frontend directory: .\restructure-admin-pages.ps1

Write-Host "Restructuring admin pages for nested application routes..." -ForegroundColor Green

$adminProgramsPath = "app\admin\pages\admin\programs"

# Create the new directory structure
Write-Host "Creating directory structure..." -ForegroundColor Yellow
New-Item -Path "$adminProgramsPath\[id]" -ItemType Directory -Force | Out-Null
New-Item -Path "$adminProgramsPath\[id]\applications" -ItemType Directory -Force | Out-Null

# Move the existing [id].vue to [id]\index.vue
Write-Host "Moving [id].vue to [id]\index.vue..." -ForegroundColor Yellow
if (Test-Path "$adminProgramsPath\[id].vue") {
    Move-Item -Path "$adminProgramsPath\[id].vue" -Destination "$adminProgramsPath\[id]\index.vue" -Force
    Write-Host "✓ Moved [id].vue to [id]\index.vue" -ForegroundColor Green
} else {
    Write-Host "✗ [id].vue not found" -ForegroundColor Red
}

Write-Host "`nRestructuring complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run 'bun install' to install the new Tiptap dependencies" -ForegroundColor White
Write-Host "2. The nested application route file has been prepared at:" -ForegroundColor White
Write-Host "   app\admin\pages\admin\programs\[id]\applications\[applicationId].vue" -ForegroundColor White
