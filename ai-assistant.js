// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadChatHistory();

    document.getElementById('sendBtn').addEventListener('click', sendMessage);
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    document.getElementById('configAIBtn').addEventListener('click', () => openAPIConfig('deepseek'));
    document.getElementById('generateFlashcardsBtn').addEventListener('click', generateFlashcards);
    document.getElementById('clearChatBtn').addEventListener('click', clearChat);

    // Auto-resize textarea
    const input = document.getElementById('chatInput');
    input.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 100) + 'px'; // Max height limit
    });
});

// Send Message
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    // Add user message
    addMessage(message, 'user');
    input.value = '';
    input.style.height = 'auto';

    // Show typing indicator
    const typingId = showTypingIndicator();

    try {
        const response = await callDeepSeekAPI([
            {
                role: 'system',
                content: 'You are a helpful AI study assistant for college students. Provide clear, concise explanations. Use examples when helpful. Keep responses focused and educational.'
            },
            ...AppState.chatHistory.slice(-10).map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            {
                role: 'user',
                content: message
            }
        ]);

        removeMessage(typingId);
        addMessage(response, 'assistant');
    } catch (error) {
        removeMessage(typingId);
        addMessage('Sorry, I encountered an error. Please check your API key and try again.', 'assistant');
    }
}

// Add Message
function addMessage(content, role) {
    const container = document.getElementById('chatMessages');
    const messageId = generateId();
    const messageClass = role === 'user' ? 'user-message' : 'ai-message';

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${messageClass}`;
    messageDiv.id = messageId;

    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${formatMessage(content)}</p>
            <span class="message-time">${time}</span>
        </div>
    `;

    container.appendChild(messageDiv);
    scrollToBottom();

    // Save to history
    const history = AppState.chatHistory;
    history.push({
        id: messageId,
        role: role === 'user' ? 'user' : 'assistant',
        content: content,
        timestamp: new Date().toISOString()
    });
    AppState.chatHistory = history;

    return messageId;
}

// Show Typing Indicator
function showTypingIndicator() {
    const container = document.getElementById('chatMessages');
    const id = generateId();

    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message ai-message';
    messageDiv.id = id;

    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;

    container.appendChild(messageDiv);
    scrollToBottom();
    return id;
}

// Remove Message
function removeMessage(id) {
    const msg = document.getElementById(id);
    if (msg) msg.remove();
}

// Scroll to Bottom
function scrollToBottom() {
    const container = document.getElementById('chatMessages');
    container.scrollTop = container.scrollHeight;
}

// Load Chat History
function loadChatHistory() {
    const container = document.getElementById('chatMessages');
    const history = AppState.chatHistory;

    if (history.length === 0) return; // Keep default welcome message if empty

    // Clear default message if history exists
    container.innerHTML = '';

    history.forEach(msg => {
        if (msg.role === 'user' || msg.role === 'assistant') {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`;
            messageDiv.id = msg.id;

            const date = new Date(msg.timestamp || Date.now());
            const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            messageDiv.innerHTML = `
                <div class="message-content">
                    <p>${formatMessage(msg.content)}</p>
                    <span class="message-time">${time}</span>
                </div>
            `;

            container.appendChild(messageDiv);
        }
    });

    scrollToBottom();
}

// Generate Flashcards from Chat
async function generateFlashcards() {
    const topic = prompt('Enter a topic to generate flashcards:');
    if (!topic) return;

    // Show status in chat header
    const statusEl = document.querySelector('.chat-status');
    const originalStatus = statusEl.textContent;
    statusEl.textContent = 'Generating flashcards...';

    try {
        await generateFlashcardsAI(topic);
        showToast(`Flashcards generated! Check the Flashcards page.`, 'success');

        // Add system message
        addMessage(`I've generated flashcards for "${topic}". You can find them in the Flashcards section!`, 'assistant');
    } catch (error) {
        console.error(error);
        showToast('Failed to generate flashcards', 'error');
    } finally {
        statusEl.textContent = originalStatus;
    }
}

// Clear Chat
function clearChat() {
    if (!confirm('Clear entire chat history?')) return;

    AppState.chatHistory = [];
    const container = document.getElementById('chatMessages');
    container.innerHTML = `
        <div class="chat-message ai-message">
            <div class="message-content">
                <p>Chat cleared! How can I help you today?</p>
                <span class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        </div>
    `;
    showToast('Chat history cleared', 'success');
}
