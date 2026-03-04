$file = 'g:\My Drive\IronWall-Gamethon\frontend\style.css'
$lines = Get-Content $file -Encoding UTF8
$trimmed = $lines[0..2124]
Set-Content -Path $file -Value $trimmed -Encoding UTF8
Write-Host "Truncated to $($trimmed.Count) lines"

$append = @'

/* ── Mobile: max-width 768px ─────────────────────────────────────── */
@media (max-width: 768px) {
  html, body {
    overflow-x: hidden;
    max-width: 100vw;
  }

  #attacker-app {
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
    box-sizing: border-box;
    padding: 10px 8px;
    gap: 8px;
  }

  .score-panel {
    grid-template-columns: 1fr 1fr 1fr;
  }

  .attack-grid {
    grid-template-columns: 1fr 1fr;
    gap: 7px;
    width: 100%;
    box-sizing: border-box;
  }

  .attack-btn {
    min-height: 85px;
    padding: 8px 5px;
    gap: 4px;
  }

  .attack-btn .btn-icon  { font-size: 1.5rem; }
  .attack-btn .btn-label { font-size: 0.68rem; word-break: break-word; }
  .attack-btn .btn-damage { font-size: 0.52rem; }

  .cve-badge {
    font-size: 0.44rem;
    padding: 1px 3px;
    white-space: normal;
    word-break: break-word;
  }

  .xray-modal, .phish-modal, .mirror-modal {
    width: 96% !important;
    padding: 15px !important;
    gap: 12px !important;
  }

  .xray-fire-zone  { padding: 10px; }
  .xray-drag-row   { gap: 8px; }

  .payload-chip    { padding: 8px 12px; font-size: 0.65rem; }
  .firing-chamber  { width: 90px; height: 70px; }

  .mirror-columns  { grid-template-columns: 1fr; gap: 16px; }
  .mirror-divider  { display: none; }

  input, select, textarea { font-size: 16px !important; }

  .attacker-title  { font-size: 0.9rem; }
  .attacker-sub    { font-size: 0.55rem; word-break: break-all; }
}

/* ── Landscape phone ─────────────────────────────────────────── */
@media (max-height: 500px) and (orientation: landscape) {
  .attack-grid { grid-template-columns: repeat(4, 1fr); }
  .attack-btn.ddos { grid-column: span 1; }
}

/* ── Informational Buttons ───────────────────────────────────── */
.attack-btn.info-btn {
  border-color: #78909c;
  color: #78909c;
  box-shadow: 0 0 15px rgba(120, 144, 156, 0.2), inset 0 0 20px rgba(120, 144, 156, 0.05);
}

.attack-btn.info-btn:hover {
  box-shadow: 0 0 25px rgba(120, 144, 156, 0.45), inset 0 0 20px rgba(120, 144, 156, 0.08);
  border-color: #90a4ae;
  color: #90a4ae;
}

/* ── CVE Badges ──────────────────────────────────────────────── */
.cve-badge {
  display: block;
  margin-top: 4px;
  font-size: 0.5rem;
  color: #ffd700;
  background: rgba(255, 215, 0, 0.08);
  border: 1px solid rgba(255, 215, 0, 0.25);
  border-radius: 3px;
  padding: 2px 5px;
  letter-spacing: 0.04em;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  cursor: help;
  transition: background 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.cve-badge:hover {
  background: rgba(255, 215, 0, 0.18);
  white-space: normal;
  z-index: 10;
  position: relative;
}

/* ── World Attack Map ────────────────────────────────────────── */
#world-map-container {
  width: 100%;
  background: rgba(0, 245, 255, 0.02);
  border-top: 1px solid rgba(0, 245, 255, 0.08);
  border-bottom: 1px solid rgba(0, 245, 255, 0.08);
  padding: 4px 0 0;
  position: relative;
}

.world-map-title {
  font-size: 0.6rem;
  color: var(--text-dim);
  letter-spacing: 0.15em;
  padding: 0 12px;
  margin-bottom: 2px;
}

#worldMapCanvas {
  width: 100%;
  height: 80px;
  display: block;
}

/* ── Stats Panel ─────────────────────────────────────────────── */
#stats-panel {
  position: fixed;
  top: 50px;
  right: 12px;
  width: 340px;
  background: rgba(3, 3, 12, 0.97);
  border: 1px solid #a855f7;
  border-radius: 8px;
  padding: 12px;
  z-index: 500;
  box-shadow: 0 0 30px rgba(168, 85, 247, 0.3);
  backdrop-filter: blur(8px);
}

#stats-panel.hidden { display: none; }

.stats-header {
  font-size: 0.65rem;
  color: #a855f7;
  letter-spacing: 0.15em;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(168, 85, 247, 0.2);
  padding-bottom: 6px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.stat-card {
  background: rgba(168, 85, 247, 0.07);
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: 6px;
  padding: 8px;
  text-align: center;
}

.stat-label {
  font-size: 0.52rem;
  color: rgba(168, 85, 247, 0.7);
  letter-spacing: 0.1em;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1rem;
  color: #e9d5ff;
  font-family: 'Orbitron', monospace;
  font-weight: 700;
}

.stats-chart-label {
  font-size: 0.58rem;
  color: rgba(168, 85, 247, 0.6);
  letter-spacing: 0.1em;
  margin-bottom: 6px;
}

#stats-bars { display: flex; flex-direction: column; gap: 5px; }

.stats-bar-row { display: flex; align-items: center; gap: 8px; font-size: 0.58rem; }
.stats-bar-label { width: 90px; color: var(--text-dim); text-align: right; }
.stats-bar-track { flex: 1; height: 10px; background: rgba(168, 85, 247, 0.1); border-radius: 5px; overflow: hidden; }
.stats-bar-fill  { height: 100%; background: linear-gradient(90deg, #a855f7, #ec4899); border-radius: 5px; transition: width 0.8s ease; }
.stats-bar-count { width: 24px; color: #e9d5ff; text-align: left; }
#sparklineCanvas { width: 100%; }

/* ── Replay Panel ────────────────────────────────────────────── */
#replay-panel {
  margin: 4px 0;
  padding: 6px 12px;
  background: rgba(0, 245, 255, 0.02);
  border-top: 1px solid rgba(0, 245, 255, 0.07);
  border-bottom: 1px solid rgba(0, 245, 255, 0.07);
}

.replay-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.6rem;
  color: var(--text-dim);
  letter-spacing: 0.12em;
  margin-bottom: 6px;
}

#replay-btn {
  background: rgba(57, 255, 20, 0.1);
  border: 1px solid var(--neon-green);
  color: var(--neon-green);
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.65rem;
  padding: 3px 10px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

#replay-btn:hover    { background: rgba(57, 255, 20, 0.2); box-shadow: 0 0 10px rgba(57, 255, 20, 0.4); }
#replay-btn:disabled { opacity: 0.4; cursor: not-allowed; }

#replay-feed { display: flex; gap: 6px; flex-wrap: wrap; min-height: 22px; }

.replay-chip {
  font-size: 0.55rem;
  background: rgba(255, 23, 68, 0.12);
  border: 1px solid rgba(255, 23, 68, 0.35);
  border-radius: 3px;
  padding: 2px 7px;
  color: var(--neon-red);
  animation: replay-pop 0.3s ease;
}

@keyframes replay-pop {
  from { transform: scale(0.7); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}
'@

Add-Content -Path $file -Value $append -Encoding UTF8
Write-Host "Appended CSS block. Final lines: $((Get-Content $file).Count)"
