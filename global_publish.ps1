Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "       IRONWALL+ GLOBAL PUBLISHER (Localtunnel)      " -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script provides instructions to securely expose your IronWall+ demo"
Write-Host "to the global internet using Localtunnel, so anyone can attack your"
Write-Host "system from their 5G phone without being on your specific Wi-Fi."
Write-Host ""

Write-Host "IronWall+ requires TWO tunnels because it uses two separate ports:" -ForegroundColor Yellow
Write-Host "  1. Port 3000 (The Dashboard / UI)"
Write-Host "  2. Port 9001 (The Rust Pingora WebSocket Engine)"
Write-Host ""

Write-Host "-----------------------------------------------------"
Write-Host "STEP 1: Expose the Web Server (Port 3000)"
Write-Host "-----------------------------------------------------"
Write-Host "Open a new terminal and run:"
Write-Host "npx localtunnel --port 3000" -ForegroundColor Green
Write-Host "-> This will generate a URL like: https://cool-web-123.loca.lt"
Write-Host ""

Write-Host "-----------------------------------------------------"
Write-Host "STEP 2: Expose the WebSocket Server (Port 9001)"
Write-Host "-----------------------------------------------------"
Write-Host "Open ANOTHER new terminal and run:"
Write-Host "npx localtunnel --port 9001" -ForegroundColor Green
Write-Host "-> This will generate a URL like: https://fast-ws-456.loca.lt"
Write-Host ""

Write-Host "-----------------------------------------------------"
Write-Host "STEP 3: Connect Your Users"
Write-Host "-----------------------------------------------------"
Write-Host "You must combine these URLs so the frontend knows where to send the attacks."
Write-Host "Change the 'https://' of the WebSocket URL to 'wss://' and pass it in the ?ws= parameter."
Write-Host ""
Write-Host "Example Link to send to Judges:" -ForegroundColor White
Write-Host "https://cool-web-123.loca.lt/attacker.html?ws=wss://fast-ws-456.loca.lt/ws" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: When Judges visit the web URL for the first time, Localtunnel requires them"
Write-Host "to click 'Click to Continue' on a warning screen before the UI loads."
Write-Host ""
