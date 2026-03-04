# ⚡ IronWall+ — Gamethon Demo

> Real-time cyberpunk network defense game. Judges attack, IronWall blocks, the crowd watches.

---

## Quick Start (2 steps)

### 1. Start the Rust backend
```powershell
cd backend
cargo run
```
Server starts on two ports:
- `ws://localhost:9001/ws` → WebSocket telemetry (game board)
- `http://localhost:8080`  → Pingora proxy (attack interception)

### 2. Open the frontend
Open both files directly in a browser (no build step needed):

| File | Purpose |
|------|---------|
| `frontend/index.html` | **Main Game Board** — project on the big screen |
| `frontend/attacker.html` | **Judge Controller** — open on phone / second tab |

---

## Architecture

```
Judge phone (attacker.html)
        │  WebSocket payload
        ▼
[LAYER 1] Pingora Proxy :8080
        │  ThreatDictionary.classify() — < 1µs RegEx
        │  BLOCKED? → drop + broadcast event
        │  SAFE?    → forward to Core Server
        ▼
[LAYER 2] axum WebSocket :9001
        │  tokio broadcast channel
        ▼
Game Board (index.html)  ←── live telemetry
  Canvas animations + WebGL glitch shader
```

## 🎮 Gamification & Educational Mechanics

IronWall+ is uniquely gamified for an engaging hackathon presentation:

1. **Hacker Progression System**: The Attacker Panel features an RPG-like leveling system. Users start as "Script Kiddies" and must land attacks to earn EXP, eventually unlocking advanced payloads (DDoS, Zero-Days).
2. **Vulnerability Patch Quizzes**: Upon catching an attack type for the first time, IronWall+ interrupts the Defense Grid with a multiple-choice pop-up quiz testing the defender on how to properly patch the root vulnerability in the source code.
3. **Phishing Simulator**: A simulated email client periodically appears on the defense board; the presenter must identify whether a payload is legitimate or phishing to earn bonus security points (or trigger a massive system compromise).

## Attack Payloads (what each button fires)

| Button | Attack Type | Severity |
|--------|-------------|---------|
| 💉 SQL Injection | `SQL_INJECTION` | 85 |
| 🌊 DDoS Swarm | `DDOS_SWARM` | 95 |
| ☢️ Zero-Day Mutator | `ZERO_DAY_MUTATOR` | 100 |

## Folder Structure
```
gamethon-demo/
├── .cargo/config.toml   ← 2-thread compile, sccache
├── backend/
│   ├── Cargo.toml
│   └── src/main.rs      ← Pingora + ThreatDictionary + axum WS
└── frontend/
    ├── index.html        ← Game Board
    ├── attacker.html     ← Judge Mobile Controller
    ├── game.js           ← Canvas engine + WebGL glitch + scoring
    ├── attacker.js       ← Button → WS firing mechanism
    └── style.css         ← Cyberpunk CRT aesthetic
```

> **Note:** This is a standalone hackathon demo. It does NOT modify the main `ironwall-plus/ironwall_rust` production codebase.
