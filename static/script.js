// DebugBot - Modern Frontend JavaScript

class DebugBot {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.clearBtn = document.getElementById('clearHistoryBtn');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.isLoading = false;
        
        this.setupEventListeners();
        this.setupAutoResize();
    }

    setupEventListeners() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.clearBtn.addEventListener('click', () => this.clearHistory());

        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshChat());
        }

        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showHelp());
        }
    }

    setupAutoResize() {
        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = Math.min(this.userInput.scrollHeight, 120) + 'px';
        });
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        
        if (!message || this.isLoading) {
            if (!message) {
                this.showNotification('Please type a message!');
            }
            return;
        }

        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        this.setLoadingState(true);

        this.addMessage(message, 'user');
        this.scrollToBottom();

        this.showTyping(true);

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            this.showTyping(false);

            if (data.exit) {
                this.addMessage(data.response, 'bot');
                this.setLoadingState(false);
                return;
            }

            if (data.response) {
                this.addMessage(data.response, 'bot');
            } else {
                throw new Error('No response from server');
            }

        } catch (error) {
            console.error('Error:', error);
            this.showTyping(false);
            this.addMessage(
                'Sorry, there was an error connecting to the server. Please try again. 🔧',
                'bot'
            );
        } finally {
            this.setLoadingState(false);
            this.scrollToBottom();
        }
    }

    addMessage(text, sender) {
        const welcomeMsg = document.querySelector('.welcome-message');
        if (welcomeMsg && this.chatMessages.children.length === 1) {
            welcomeMsg.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const strong = document.createElement('strong');
        strong.textContent = sender === 'user' ? '👤 You' : '🤖 DebugBot';
        contentDiv.appendChild(strong);
        
        const paragraphs = text.split('\n').filter(p => p.trim());
        paragraphs.forEach(p => {
            const pElement = document.createElement('p');
            pElement.textContent = p;
            contentDiv.appendChild(pElement);
        });
        
        messageDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(messageDiv);
    }

    showTyping(show) {
        if (show) {
            this.typingIndicator.style.display = 'flex';
        } else {
            this.typingIndicator.style.display = 'none';
        }
    }

    setLoadingState(loading) {
        this.isLoading = loading;
        this.sendBtn.disabled = loading;
        this.sendBtn.innerHTML = loading ? 
            '<i class="fas fa-spinner fa-spin"></i><span>Sending</span>' : 
            '<i class="fas fa-paper-plane"></i><span>Send</span>';
        this.userInput.disabled = loading;
    }

    async clearHistory() {
        if (this.isLoading) return;
        
        try {
            const response = await fetch('/clear_history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                while (this.chatMessages.children.length > 0) {
                    this.chatMessages.removeChild(this.chatMessages.firstChild);
                }
                
                this.chatMessages.innerHTML = `
                    <div class="welcome-message">
                        <div class="welcome-icon">
                            <i class="fas fa-hand-peace"></i>
                        </div>
                        <h2>Assalam-o-Alaikum! 👋</h2>
                        <p>I'm <strong>DebugBot</strong>, your AI debugging assistant.</p>
                        <p>Ask me about Python errors, debugging tips, or coding help!</p>
                        <div class="welcome-tags">
                            <span class="tag"><i class="fas fa-bug"></i> Debugging</span>
                            <span class="tag"><i class="fas fa-code"></i> Python</span>
                            <span class="tag"><i class="fas fa-graduation-cap"></i> Learning</span>
                        </div>
                    </div>
                `;
                
                this.showNotification('History cleared! ✨');
            }
        } catch (error) {
            console.error('Error clearing history:', error);
            this.showNotification('Failed to clear history');
        }
    }

    refreshChat() {
        if (this.isLoading) return;
        this.scrollToBottom();
        this.showNotification('Chat refreshed! 🔄');
    }

    showHelp() {
        const helpMessage = `
            🤖 **DebugBot Help** 🤖
            
            💡 **Ask me about:**
            • Python errors and exceptions
            • Debugging techniques
            • Code review and fixes
            • Best practices
            
            ⌨️ **Tips:**
            • Press Enter to send
            • Use clear, specific questions
            • Share error messages for better help
        `;
        this.addMessage(helpMessage, 'bot');
        this.scrollToBottom();
    }

    showNotification(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 14px;
            z-index: 9999;
            animation: slideInUp 0.3s ease-out;
            border: 1px solid rgba(255,255,255,0.1);
            font-family: 'Inter', sans-serif;
        `;
        toast.textContent = message;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            toast.style.transition = 'all 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
}

function fillSuggestion(text) {
    const input = document.getElementById('userInput');
    if (input) {
        input.value = text;
        input.focus();
        setTimeout(() => {
            const bot = document.querySelector('.chat-messages-modern')?.__botInstance;
            if (bot) {
                bot.sendMessage();
            } else {
                document.getElementById('sendBtn')?.click();
            }
        }, 300);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const bot = new DebugBot();
    const messagesContainer = document.querySelector('.chat-messages-modern');
    if (messagesContainer) {
        messagesContainer.__botInstance = bot;
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            document.getElementById('userInput')?.focus();
        }
    });
});
