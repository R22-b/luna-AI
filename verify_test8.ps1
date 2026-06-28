Add-Type -AssemblyName System.Windows.Forms

$projectDir = "C:\Users\Ravikiran\OneDrive\Desktop\luna_AI (3)\luna"
$distDir = "C:\Users\Ravikiran\OneDrive\Desktop\luna_AI (3)\luna\dist"
$installDir = "$env:LOCALAPPDATA\Programs\luna-ai"

Write-Host "========================================================"
Write-Host "   TEST 8 - Application Size and Resource Usage           "
Write-Host "========================================================"
Write-Host ""

$nmSize = 0
if (Test-Path "$projectDir\node_modules") {
    $nmSize = (Get-ChildItem -Path "$projectDir\node_modules" -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
}

$totalSize = (Get-ChildItem -Path $projectDir -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
$projectNoNmSize = $totalSize - $nmSize

$installerSize = 0
if (Test-Path "$distDir") {
    $exe = Get-ChildItem -Path $distDir -Filter "*.exe" -File -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($exe) {
        $installerSize = $exe.Length / 1MB
    }
}

$installedSize = 0
if (Test-Path $installDir) {
    $installedSize = (Get-ChildItem -Path $installDir -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
}

Write-Host "--- APPLICATION SIZE ---"
Write-Host "Total project folder size (excluding node_modules): $([math]::Round($projectNoNmSize, 2)) MB"
Write-Host "node_modules folder size: $([math]::Round($nmSize, 2)) MB"
Write-Host "Final installer .exe size: $(if ($installerSize -eq 0) { 'Not built/found' } else { $([math]::Round($installerSize, 2)) + ' MB' })"
Write-Host "Installed app size: $(if ($installedSize -eq 0) { 'Not installed/found in default path' } else { $([math]::Round($installedSize, 2)) + ' MB' })"
Write-Host ""

Write-Host "--- RESOURCE USAGE (IDLE) ---"
Write-Host "Starting Luna..."

$npmProc = Start-Process -FilePath "npm.cmd" -ArgumentList "run start" -WorkingDirectory $projectDir -PassThru -WindowStyle Hidden

Write-Host "Waiting 20 seconds for Luna to fully load..."
Start-Sleep -Seconds 20

function Get-ElectronStats {
    $procs = Get-Process | Where-Object { $_.Name -match "electron|luna" -and $_.Id -ne $PID }
    if ($procs.Count -eq 0) { return $null }

    $mainProc = $procs | Sort-Object Id | Select-Object -First 1
    $renderers = $procs | Where-Object { $_.Id -ne $mainProc.Id }

    $mainRam = $mainProc.WorkingSet64 / 1MB
    $rendRam = 0
    if ($renderers) {
        $rendRam = ($renderers | Measure-Object -Property WorkingSet64 -Sum).Sum / 1MB
    }
    $totalRam = $mainRam + $rendRam
    
    $totalCpuBefore = 0
    foreach ($p in $procs) { $totalCpuBefore += $p.TotalProcessorTime.TotalMilliseconds }
    $wallBefore = Get-Date
    Start-Sleep -Seconds 5
    $procsAfter = Get-Process | Where-Object { $_.Name -match "electron|luna" -and $_.Id -ne $PID }
    $totalCpuAfter = 0
    foreach ($p in $procsAfter) { $totalCpuAfter += $p.TotalProcessorTime.TotalMilliseconds }
    $wallAfter = Get-Date
    
    $cpuUsed = $totalCpuAfter - $totalCpuBefore
    $wallDiff = $wallAfter - $wallBefore
    $cores = (Get-WmiObject Win32_Processor).NumberOfLogicalProcessors
    $cpuPercent = ($cpuUsed.TotalMilliseconds / ($wallDiff.TotalMilliseconds * $cores)) * 100
    
    return @{ MainRam=$mainRam; RendRam=$rendRam; TotalRam=$totalRam; CpuPercent=$cpuPercent; Procs=$procs }
}

$idleStats = Get-ElectronStats
if ($null -eq $idleStats) {
    Write-Host "Failed to detect running Luna processes."
} else {
    Write-Host "RAM usage of main process: $([math]::Round($idleStats.MainRam, 2)) MB"
    Write-Host "RAM usage of renderer processes ($($idleStats.Procs.Count - 1)): $([math]::Round($idleStats.RendRam, 2)) MB"
    Write-Host "Total combined RAM footprint: $([math]::Round($idleStats.TotalRam, 2)) MB"
    Write-Host "CPU usage percent while idle (sampled over 5s): $([math]::Round($idleStats.CpuPercent, 2)) %"
    
    Write-Host ""
    Write-Host "--- RESOURCE USAGE (ACTIVE REQUEST) ---"
    Write-Host "Sending chat message 'Hello Luna' via SendKeys..."
    
    # Activate window
    $wshell = New-Object -ComObject wscript.shell
    $wshell.AppActivate("Luna") | Out-Null
    Start-Sleep -Seconds 1
    
    # Send keys
    [System.Windows.Forms.SendKeys]::SendWait("Hello Luna{ENTER}")
    
    Write-Host "Measuring during active request..."
    $activeStats = Get-ElectronStats
    
    Write-Host "RAM usage of main process (Active): $([math]::Round($activeStats.MainRam, 2)) MB"
    Write-Host "RAM usage of renderer processes (Active): $([math]::Round($activeStats.RendRam, 2)) MB"
    Write-Host "Total combined RAM footprint (Active): $([math]::Round($activeStats.TotalRam, 2)) MB"
    Write-Host "CPU usage percent during request (sampled over 5s): $([math]::Round($activeStats.CpuPercent, 2)) %"
}

Write-Host "Closing Luna..."
if ($idleStats -ne $null) {
    $idleStats.Procs | Stop-Process -Force -ErrorAction SilentlyContinue
}
$npmProc | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "========================================================"
Write-Host "   TEST 8 COMPLETE                                      "
Write-Host "========================================================"
