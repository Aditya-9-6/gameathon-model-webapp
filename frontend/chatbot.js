// ════════════════════════════════════════════════════════════════════════════
// IRONWALL+ LOCAL AI CONSULTANT (PHI-3 / OLLAMA / LM STUDIO INTEGRATION)
// ════════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    const aiToggleBtn = document.getElementById('ai-chat-toggle-btn');
    const aiPanel = document.getElementById('ai-chat-panel');
    const aiCloseBtn = document.getElementById('ai-chat-close');
    const aiInput = document.getElementById('ai-chat-input');
    const aiSendBtn = document.getElementById('ai-chat-send');
    const aiHistory = document.getElementById('ai-chat-history');

    // Config fields
    const epUrlInput = document.getElementById('ai-endpoint-url');
    const modelNameInput = document.getElementById('ai-model-name');

    if (!aiToggleBtn || !aiPanel) return;

    // ── Pre-defined Cyberpunk System Prompt ──
    let chatHistoryLog = [
        {
            role: "system",
            content: "You are the IronWall+ AI Consultant, a highly advanced cybersecurity defensive AI built into a cyberpunk Web Application Firewall. Answer concisely. Explain cyber attacks (SQLi, XSS, DDoS, Path Traversal, etc.) and how to mitigate them. Keep your tone professional, authoritative, and slightly robotic/cyberpunk. Do not use emojis unless absolutely necessary. Format code answers clearly."
        }
    ];

    // Toggle Panel
    aiToggleBtn.addEventListener('click', () => {
        aiPanel.classList.toggle('open');
        if (aiPanel.classList.contains('open')) {
            aiInput.focus();
        }
    });

    aiCloseBtn.addEventListener('click', () => {
        aiPanel.classList.remove('open');
    });

    // Send Message
    async function handleSend() {
        const text = aiInput.value.trim();
        if (!text) return;

        // 1. Add User Message to UI & Log
        appendMessage('user', text);
        chatHistoryLog.push({ role: "user", content: text });
        aiInput.value = '';
        aiSendBtn.disabled = true;
        aiInput.disabled = true;

        // 2. Add empty AI Message to UI to stream into
        const aiMsgDiv = appendMessage('ai', '<strong>SYSTEM:</strong> <span class="typing">...</span>');
        const contentSpan = aiMsgDiv.querySelector('.typing');

        const endpoint = epUrlInput.value.trim();
        const model = modelNameInput.value.trim();

        // 3. Make API Call natively via fetch (OpenAI compatible format)
        try {
            // Some endpoints use /api/chat (Ollama native), some use /v1/chat/completions (LM Studio / OpenAI)
            // We pass standard OpenAI format, which many local runners support.
            const payload = {
                model: model,
                messages: chatHistoryLog,
                temperature: 0.3,
                max_tokens: 300
            };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Handle both OpenAI standard and some Ollama native return shapes
            let replyText = "";
            if (data.choices && data.choices[0].message) {
                replyText = data.choices[0].message.content; // OpenAI format (LM Studio, GPT4All)
            } else if (data.message && data.message.content) {
                replyText = data.message.content; // Ollama native format
            } else if (data.response) {
                replyText = data.response; // Ollama generate format
            } else {
                replyText = "[Error Parsing Local LLM Response Format]";
            }

            contentSpan.innerHTML = formatMarkdown(replyText);
            chatHistoryLog.push({ role: "assistant", content: replyText });

            // Optional voice synthesis
            if (window.voiceSynth && window.audio && window.audio.enabled) {
                // voiceSynth.speak(replyText.replace(/[^a-zA-Z0-9.,? ]/g, ''));
            }

        } catch (error) {
            contentSpan.innerHTML = `<span style="color:#ff1744">[CONNECTION FAILED] Unable to reach Local LLM at ${endpoint}. Please ensure the server is running.</span>`;
            console.error("Local LLM Error:", error);
        } finally {
            aiSendBtn.disabled = false;
            aiInput.disabled = false;
            aiInput.focus();
            aiHistory.scrollTop = aiHistory.scrollHeight;
        }
    }

    aiSendBtn.addEventListener('click', handleSend);
    aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    // Helper: append visually to the chat panel
    function appendMessage(role, htmlContent) {
        const div = document.createElement('div');
        div.className = `chat-msg ${role}`;
        if (role === 'user') {
            div.innerHTML = htmlContent;
        } else {
            div.innerHTML = htmlContent;
        }
        aiHistory.appendChild(div);
        setTimeout(() => { aiHistory.scrollTop = aiHistory.scrollHeight; }, 50);
        return div;
    }

    // Helper: basic markdown to HTML for code blocks
    function formatMarkdown(text) {
        let html = text.replace(/```([\s\S]*?)```/g, '<pre style="background:#050510;border:1px solid #444;padding:8px;margin:5px 0;"><code>$1</code></pre>');
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\n/g, '<br>');
        return html;
    }
});
