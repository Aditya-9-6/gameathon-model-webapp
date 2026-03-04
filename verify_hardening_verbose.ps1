
# verify_hardening_verbose.ps1
$backendPath = "C:\ironwall-gamethon-target\debug\ironwall-gamethon.exe"
$logFile = "C:\Users\om laptop house\.gemini\antigravity\brain\fccf4027-539f-41c0-9fab-dce7356dc6b8\backend_verbose.log"

Remove-Item $logFile -ErrorAction SilentlyContinue

Write-Host "Starting Backend..."
$process = Start-Process $backendPath -NoNewWindow -PassThru -RedirectStandardOutput $logFile -RedirectStandardError $logFile

Write-Host "Waiting for port 9001..."
$count = 0
while (!(netstat -ano | findstr :9001) -and $count -lt 30) { Start-Sleep -Seconds 1; $count++ }

if (!(netstat -ano | findstr :9001)) {
    Write-Error "Backend failed to start."
    if ($process) { Stop-Process -Id $process.Id -Force }
    exit 1
}

Write-Host "Connecting WebSocket..."
try {
    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $uri = New-Object System.Uri("ws://localhost:9001/ws")
    $ct = New-Object System.Threading.CancellationTokenSource
    $ws.ConnectAsync($uri, $ct.Token).Wait()

    Write-Host "Firing 5 attacks..."
    for ($i = 1; $i -le 5; $i++) {
        $payload = @{
            attack_type = "SQL_INJECTION"
            origin_ip   = "127.0.0.1"
            payload     = "MALICIOUS_LOG_PROBE_$i"
        } | ConvertTo-Json -Compress
        
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
        $buffer = New-Object System.ArraySegment[byte] -ArgumentList @(, $bytes)
        $ws.SendAsync($buffer, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $ct.Token).Wait()
        Write-Host "  Sent attack $i"
        Start-Sleep -Seconds 1
    }
    Start-Sleep -Seconds 2
    $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "Done", $ct.Token).Wait()
}
catch { Write-Error "WS Error: $_" }

Write-Host "Stopping Backend..."
if ($process) { Stop-Process -Id $process.Id -Force }

Write-Host "Reading Full Log Content:"
if (Test-Path $logFile) {
    $content = Get-Content $logFile
    $content | foreach { Write-Host $_ }
}
else { Write-Error "Log not found" }
