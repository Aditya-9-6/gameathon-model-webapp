
# verify_hardening.ps1
# Automated verification for Tartarus Engine Banishment Logic

$backendPath = "C:\ironwall-gamethon-target\debug\ironwall-gamethon.exe"
$logFile = "C:\Users\om laptop house\.gemini\antigravity\brain\fccf4027-539f-41c0-9fab-dce7356dc6b8\backend_verify.log"

Write-Host "Starting Backend for Hardening Verification..."
$process = Start-Process $backendPath -NoNewWindow -PassThru -RedirectStandardOutput $logFile

Write-Host "Waiting for port 9001 to open..."
$count = 0
while (!(netstat -ano | findstr :9001) -and $count -lt 30) {
    Start-Sleep -Seconds 1
    $count++
}

if (!(netstat -ano | findstr :9001)) {
    Write-Error "Backend failed to start on port 9001."
    if ($process) { Stop-Process -Id $process.Id -Force }
    exit 1
}

Write-Host "Port 9001 is OPEN. Connecting WebSocket..."
try {
    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $uri = New-Object System.Uri("ws://localhost:9001/ws")
    $ct = New-Object System.Threading.CancellationTokenSource
    
    $connectTask = $ws.ConnectAsync($uri, $ct.Token)
    while (!$connectTask.IsCompleted) { Start-Sleep -Milliseconds 100 }

    Write-Host "Firing 5 SQL Injection attacks..."
    for ($i = 1; $i -le 5; $i++) {
        $payload = @{
            attack_type = "SQL_INJECTION"
            origin_ip   = "127.0.0.1"
            payload     = "OR '1'='1' --"
            timestamp   = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
            sequence    = $i
        } | ConvertTo-Json -Compress
        
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
        $buffer = New-Object System.ArraySegment[byte] -ArgumentList @(, $bytes)
        $sendTask = $ws.SendAsync($buffer, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $ct.Token)
        while (!$sendTask.IsCompleted) { Start-Sleep -Milliseconds 100 }
        
        Write-Host "  Attack $i sent."
        Start-Sleep -Seconds 1
    }

    Write-Host "Attack sequence complete. Waiting for log sync..."
    Start-Sleep -Seconds 3
    
    $closeTask = $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "Done", $ct.Token)
    while (!$closeTask.IsCompleted) { Start-Sleep -Milliseconds 100 }
}
catch {
    Write-Error "WebSocket Error: $_"
}

Write-Host "Stopping Backend..."
if ($process) { Stop-Process -Id $process.Id -Force }

Write-Host "Reading Verification Log..."
if (Test-Path $logFile) {
    $logs = Get-Content $logFile
    $banished = $logs | Select-String "banished to Mirror Dimension"

    if ($banished) {
        Write-Host "SUCCESS: Tartarus Engine correctly banished the persistent threat."
        Write-Host "$banished"
    }
    else {
        Write-Host "FAILURE: Banishment log not found."
        Write-Host "Last 10 lines of log:"
        $logs | Select-Object -Last 10
    }
}
else {
    Write-Error "Log file not found at $logFile"
}

# Clean up
# Remove-Item $logFile -ErrorAction SilentlyContinue 
