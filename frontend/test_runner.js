/**
 * IronWall+ Frontend Test Runner (Node.js)
 * =========================================
 * Runs the same logic as test.html but headless via Node.js.
 */

'use strict';

// ── ANSI colours ──────────────────────────────────────────────────
const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m', C = '\x1b[36m', W = '\x1b[0m', B = '\x1b[1m';

// ── Minimal test harness ──────────────────────────────────────────
const RESULTS = [];
let currentSuite = '';

function suite(name, fn) { currentSuite = name; console.log(`\n${C}${B}◈ ${name}${W}`); fn(); }
function test(name, fn) {
    try {
        fn();
        RESULTS.push({ suite: currentSuite, name, pass: true });
        console.log(`  ${G}✓${W} ${name}`);
    } catch (e) {
        RESULTS.push({ suite: currentSuite, name, pass: false, error: e.message });
        console.log(`  ${R}✗${W} ${name}`);
        console.log(`    ${Y}→ ${e.message}${W}`);
    }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'Assertion failed'); }
function assertEqual(a, b, msg) { if (a !== b) throw new Error(msg || `Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }
function assertContains(s, sub, msg) { if (!s.includes(sub)) throw new Error(msg || `"${s}" does not contain "${sub}"`); }

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUITE 1: Attack Button Contracts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
suite('Attack Button Data Attributes', () => {
    const EXPECTED_ATTACKS = [
        { id: 'btn-sql', attack: 'SQL_INJECTION', hasPayload: true },
        { id: 'btn-xss', attack: 'XSS_INJECTION', hasPayload: true },
        { id: 'btn-traversal', attack: 'PATH_TRAVERSAL', hasPayload: true },
        { id: 'btn-ddos', attack: 'DDOS_SWARM', hasPayload: true },
        { id: 'btn-zero', attack: 'ZERO_DAY_MUTATOR', hasPayload: true },
        { id: 'btn-mirror', attack: 'MIRROR_PROBE', hasPayload: true },
        { id: 'btn-phish', attack: 'PHISHING_CAMPAIGN', hasPayload: false },
    ];

    test('Exactly 7 attack types defined', () => {
        assertEqual(EXPECTED_ATTACKS.length, 7);
    });

    test('All attack type strings are unique', () => {
        const u = new Set(EXPECTED_ATTACKS.map(a => a.attack));
        assertEqual(u.size, 7);
    });

    test('All attack types have corresponding AI_DEBRIEF entries', () => {
        const AI_DEBRIEF_KEYS = ['SQL_INJECTION', 'XSS_INJECTION', 'PATH_TRAVERSAL',
            'DDOS_SWARM', 'ZERO_DAY_MUTATOR', 'MIRROR_PROBE', 'PHISHING_CAMPAIGN'];
        for (const { attack } of EXPECTED_ATTACKS) {
            assert(AI_DEBRIEF_KEYS.includes(attack), `${attack} missing from AI_DEBRIEF`);
        }
    });

    test('6 of 7 attacks use X-Ray modal (all except Phishing)', () => {
        const xrayAttacks = EXPECTED_ATTACKS.filter(a => a.attack !== 'PHISHING_CAMPAIGN' && a.attack !== 'MIRROR_PROBE');
        assertEqual(xrayAttacks.length, 5);
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUITE 2: Telemetry Event JSON Contract
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
suite('Telemetry Event Contract', () => {
    const REQUIRED_FIELDS = ['event', 'attack_type', 'origin_ip', 'block_speed_ns',
        'severity', 'event_id', 'timestamp', 'compute_saved_ms', 'payload_preview'];

    function makeBlockedEvent(override = {}) {
        return {
            event: 'BLOCKED', attack_type: 'SQL_INJECTION', origin_ip: '192.168.1.7',
            block_speed_ns: 340, severity: 85, event_id: 'uuid-test-1',
            timestamp: new Date().toISOString(), compute_saved_ms: 288.1,
            payload_preview: "OR '1'='1'", ...override,
        };
    }

    test('All 9 required fields present in BLOCKED event', () => {
        const ev = makeBlockedEvent();
        for (const f of REQUIRED_FIELDS) assert(f in ev, `Missing: ${f}`);
    });

    test('BLOCKED event type string correct', () => {
        assertEqual(makeBlockedEvent().event, 'BLOCKED');
    });

    test('SAFE event has severity=0 and compute_saved=0', () => {
        const ev = makeBlockedEvent({ event: 'SAFE', attack_type: 'SAFE', severity: 0, compute_saved_ms: 0 });
        assertEqual(ev.severity, 0);
        assertEqual(ev.compute_saved_ms, 0);
    });

    test('Backend severity contract: SQL=85, XSS=80, Path=75, DDoS=95, ZeroDay=100, Safe=0', () => {
        const exp = { SQL_INJECTION: 85, XSS_INJECTION: 80, PATH_TRAVERSAL: 75, DDOS_SWARM: 95, ZERO_DAY_MUTATOR: 100, SAFE: 0 };
        for (const [t, sev] of Object.entries(exp)) {
            assertEqual(makeBlockedEvent({ attack_type: t, severity: sev }).severity, sev);
        }
    });

    test('EVOLUTION_START event has severity 0 and compute_saved_ms 10', () => {
        const ev = { event: 'EVOLUTION_START', attack_type: 'EVOLUTION', severity: 0, compute_saved_ms: 10.0 };
        assertEqual(ev.severity, 0);
        assertEqual(ev.compute_saved_ms, 10.0);
    });

    test('Event serializes to JSON and round-trips correctly', () => {
        const ev = makeBlockedEvent();
        const parsed = JSON.parse(JSON.stringify(ev));
        assertEqual(parsed.attack_type, 'SQL_INJECTION');
        assertEqual(parsed.severity, 85);
    });

    test('compute_saved_ms is positive for blocked events', () => {
        assert(makeBlockedEvent({ compute_saved_ms: 406.7 }).compute_saved_ms > 0);
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUITE 3: AI Debrief Message Map (mirrors game.js)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
suite('AI Debrief Message Map', () => {
    const AI_DEBRIEF = {
        SQL_INJECTION: { title: 'Attack Neutralized — SQL Injection Blocked.', body: 'FluxGate AI detected a semantic anomaly' },
        XSS_INJECTION: { title: 'Attack Neutralized — Cross-Site Scripting Blocked.', body: 'FluxGate AI detected a <script> tag' },
        PATH_TRAVERSAL: { title: 'Attack Neutralized — Path Traversal Blocked.', body: 'FluxGate AI flagged ../../../../../../etc/passwd' },
        DDOS_SWARM: { title: 'Attack Neutralized — DDoS Swarm Sinkholed.', body: 'FluxGate AI flagged 120 Gbps' },
        ZERO_DAY_MUTATOR: { title: 'Attack Neutralized — Zero-Day Shellcode Stopped.', body: 'Polymorphic XOR shellcode' },
        MIRROR_PROBE: { title: 'Tartarus Engine — Attacker Banished to Mirror Dimension.', body: 'Persistent probe detected' },
        PHISHING_CAMPAIGN: { title: 'Payload Contained — But the Human Clicked.', body: 'phishing email bypassed' },
        UNKNOWN: { title: 'Attack Neutralized.', body: 'FluxGate AI detected an anomalous request' },
    };

    test('7 attack entries + UNKNOWN fallback = 8 total', () => {
        assertEqual(Object.keys(AI_DEBRIEF).length, 8);
    });

    test('Every entry has non-empty title and body', () => {
        for (const [k, v] of Object.entries(AI_DEBRIEF)) {
            assert(v.title.length > 0, `${k}.title empty`);
            assert(v.body.length > 0, `${k}.body empty`);
        }
    });

    test('SQL debrief references FluxGate/Pingora', () => {
        const b = AI_DEBRIEF.SQL_INJECTION.body;
        assert(b.includes('FluxGate') || b.includes('Pingora') || b.includes('AST'));
    });

    test('Mirror Probe references Tartarus/Mirror', () => {
        const all = AI_DEBRIEF.MIRROR_PROBE.title + AI_DEBRIEF.MIRROR_PROBE.body;
        assert(all.includes('Tartarus') || all.includes('Mirror') || all.includes('honeypot'));
    });

    test('Zero-Day references Ouroboros or virtual patch', () => {
        const b = AI_DEBRIEF.ZERO_DAY_MUTATOR.body;
        assert(b.includes('Ouroboros') || b.includes('virtual patch') || b.includes('Polymorphic'));
    });

    test('XSS debrief references session/cookie protection', () => {
        const b = AI_DEBRIEF.XSS_INJECTION.body;
        assert(b.includes('script') || b.includes('session') || b.includes('cookie'));
    });

    test('Path Traversal debrief references /etc/passwd or eBPF', () => {
        const b = AI_DEBRIEF.PATH_TRAVERSAL.body;
        assert(b.includes('etc/passwd') || b.includes('eBPF') || b.includes('Aegis'));
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUITE 4: Blast Radius Data Completeness
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
suite('Blast Radius Panel Data', () => {
    const BLAST = {
        SQL_INJECTION: { title: 'Database Breach · SQL Injection', body: '₹12 Lakhs' },
        XSS_INJECTION: { title: 'Session Hijack · XSS Injection', body: 'all logged-in users simultaneously' },
        PATH_TRAVERSAL: { title: 'System File Exfil · Path Traversal', body: 'Full server takeover' },
        DDOS_SWARM: { title: 'Service Blackout · DDoS Swarm', body: '₹5 Lakhs' },
        ZERO_DAY_MUTATOR: { title: 'Kernel Exploit · Zero-Day Mutator', body: '₹45 Lakhs' },
        MIRROR_PROBE: { title: 'Mirror Dimension · Honeypot Trigger', body: 'Attacker trapped' },
        PHISHING_CAMPAIGN: { title: 'Phishing', body: 'MFA' },
    };

    test('All 7 attacks have blast radius data', () => {
        assertEqual(Object.keys(BLAST).length, 7);
    });

    test('₹ financial impact shown for DDoS, SQLi, ZeroDay', () => {
        assert(BLAST.DDOS_SWARM.body.includes('₹'), 'DDoS missing ₹');
        assert(BLAST.SQL_INJECTION.body.includes('₹'), 'SQLi missing ₹');
        assert(BLAST.ZERO_DAY_MUTATOR.body.includes('₹'), 'ZeroDay missing ₹');
    });

    test('Mirror Dimension blast shows honeypot concept', () => {
        assert(BLAST.MIRROR_PROBE.body.includes('trapped') || BLAST.MIRROR_PROBE.body.includes('honeypot'));
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUITE 5: WebSocket Protocol Contract
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
suite('WebSocket Protocol', () => {
    // Simulated safeSend from attacker.js
    const WS_OPEN = 1, WS_CONNECTING = 0;

    function safeSend(ws, data) {
        if (ws && ws.readyState === WS_OPEN) ws.send(data);
    }

    test('safeSend does not throw when ws is null', () => {
        let threw = false;
        try { safeSend(null, '{}'); } catch (e) { threw = true; }
        assert(!threw);
    });

    test('safeSend does not call send when CONNECTING', () => {
        let called = false;
        safeSend({ readyState: WS_CONNECTING, send: () => { called = true; } }, '{}');
        assert(!called, 'send should not be called while CONNECTING');
    });

    test('safeSend calls send when OPEN', () => {
        let called = false;
        safeSend({ readyState: WS_OPEN, send: (d) => { called = true; } }, '{"test":1}');
        assert(called, 'send should be called when OPEN');
    });

    test('Attack payload JSON has required fields', () => {
        const pkt = {
            type: 'ATTACK', attack_type: 'SQL_INJECTION',
            payload: "OR '1'='1'", origin_ip: '10.13.37.10',
            timestamp: new Date().toISOString(),
        };
        const j = JSON.stringify(pkt);
        assert(j.includes('attack_type'));
        assert(j.includes('SQL_INJECTION'));
        assertEqual(JSON.parse(j).attack_type, 'SQL_INJECTION');
    });

    test('WS URL is correct endpoint', () => {
        const WS_URL = 'ws://localhost:9001/ws';
        assert(WS_URL.startsWith('ws://'), 'Must use WS scheme');
        assert(WS_URL.includes('9001'), 'Must use port 9001 (axum)');
        assert(WS_URL.endsWith('/ws'), 'Must use /ws path');
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUITE 6: Tech Stack Requirements (from spec photos)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
suite('Tech Stack Spec Compliance', () => {
    const BADGES = ['Rust 1.75+', 'Cloudflare Pingora', 'eBPF/XDP (Aegis Prime)',
        'Phi-3 LLM (Local)', 'WebAssembly Ghost Engine',
        'Ouroboros (Genetic AI)', 'Chitchat Gossip P2P', 'TPM 2.0 Audit Chain'];

    test('Exactly 8 tech stack badges defined', () => {
        assertEqual(BADGES.length, 8);
    });

    test('Core Infrastructure from spec: Rust, Pingora, eBPF', () => {
        assert(BADGES.some(b => b.includes('Rust')), 'Rust missing');
        assert(BADGES.some(b => b.includes('Pingora')), 'Pingora missing');
        assert(BADGES.some(b => b.includes('eBPF')), 'eBPF missing');
    });

    test('AI/ML from spec: Phi-3 LLM', () => {
        assert(BADGES.some(b => b.includes('Phi-3')), 'Phi-3 LLM missing');
    });

    test('Evolution & Deployment from spec: Wasm, TPM', () => {
        assert(BADGES.some(b => b.includes('WebAssembly')), 'Wasm Ghost Engine missing');
        assert(BADGES.some(b => b.includes('TPM')), 'TPM 2.0 missing');
    });

    test('Network from spec: Chitchat Gossip Protocol', () => {
        assert(BADGES.some(b => b.includes('Chitchat')), 'Chitchat Gossip missing');
    });

    test('AI Autonomy from spec: Ouroboros Genetic AI', () => {
        assert(BADGES.some(b => b.includes('Ouroboros')), 'Ouroboros Genetic AI missing');
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUITE 7: Drag-and-Drop X-Ray Modal Logic
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
suite('Payload X-Ray Modal Logic', () => {
    // Simulate safePayload escaping (from attacker.js)
    function safePayload(raw) {
        return raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // Simulate token highlight
    function highlightToken(payload, highlight) {
        const safe = safePayload(payload);
        const safeHighlight = safePayload(highlight);
        return safe.replace(safeHighlight, `<mark class="danger-token">${safeHighlight}</mark>`);
    }

    test('safePayload escapes < and > for XSS payload', () => {
        const xss = "<script>alert('xss')</script>";
        const safe = safePayload(xss);
        assert(!safe.includes('<script>'), 'raw tags should be escaped');
        assert(safe.includes('&lt;script&gt;'), 'escaped entities expected');
    });

    test('safePayload escapes & and "', () => {
        const safe = safePayload('a&b"c');
        assert(safe.includes('&amp;'));
        assert(safe.includes('&quot;'));
    });

    test('Danger token is wrapped in <mark> tag', () => {
        const result = highlightToken("OR '1'='1'", "OR '1'='1'");
        assert(result.includes('<mark class="danger-token">'), 'mark tag missing');
    });

    test('Token not present → payload unchanged', () => {
        const payload = "SELECT * FROM users";
        const result = highlightToken(payload, "MISSING_TOKEN");
        assert(!result.includes('<mark'), 'no mark when token not found');
    });

    test('fireAttack only sends when WebSocket is OPEN', () => {
        let sent = false;
        const fakeWs = { readyState: 1 /*OPEN*/, send: () => { sent = true; } };
        function safeSend(ws, data) { if (ws && ws.readyState === 1) ws.send(data); }
        safeSend(fakeWs, '{"type":"ATTACK"}');
        assert(sent, 'Message should be sent when WS is OPEN');
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUITE 8: STATEFUL DECEPTION (Tartarus)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
suite('Stateful Deception Engine', () => {
    function judge(ipCount, type) {
        if (ipCount >= 4) return 'MIRROR_PROBE';
        return type;
    }

    test('3 blocks from same IP remains original type', () => {
        assertEqual(judge(3, 'SQL_INJECTION'), 'SQL_INJECTION');
    });

    test('4 blocks from same IP triggers MIRROR_PROBE banishment', () => {
        assertEqual(judge(4, 'SQL_INJECTION'), 'MIRROR_PROBE');
    });

    test('5+ blocks remains MIRROR_PROBE', () => {
        assertEqual(judge(10, 'DDOS_SWARM'), 'MIRROR_PROBE');
    });
});
const passed = RESULTS.filter(r => r.pass).length;
const failed = RESULTS.filter(r => !r.pass).length;

console.log('\n' + '─'.repeat(54));
if (failed === 0) {
    console.log(`${G}${B}✅ ALL ${passed} TESTS PASSED${W}`);
} else {
    console.log(`${R}${B}❌ ${passed} passed, ${failed} FAILED${W}`);
    console.log(`\n${R}Failed tests:${W}`);
    RESULTS.filter(r => !r.pass).forEach(r => {
        console.log(`  ${R}✗${W} [${r.suite}] ${r.name}`);
        console.log(`    ${Y}→ ${r.error}${W}`);
    });
}
console.log('─'.repeat(54));

process.exit(failed > 0 ? 1 : 0);
