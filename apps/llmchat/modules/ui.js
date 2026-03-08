// llmchat/modules/ui.js - ChatUI 类
import Security from '../../_shared/security.js';

class ChatUI {
  constructor(store, api) {
    this.store = store;
    this.api = api;
    this.isGenerating = false;
    this.init();
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    document.addEventListener('click', (e) => {
      // 发送按钮
      const sendBtn = e.target.closest('#sendBtn');
      if (sendBtn) {
        this.handleSend();
      }
      
      // 设置按钮
      const settingsBtn = e.target.closest('.footer-btn')?.querySelector('svg')?.closest('.footer-btn');
      if (settingsBtn) {
        this.openSettings();
      }
      
      // 新建对话
      const newChatBtn = e.target.closest('.new-chat-btn');
      if (newChatBtn) {
        this.handleNewChat();
      }
      
      // 复制消息
      const copyBtn = e.target.closest('.msg-action-btn')?.querySelector('svg')?.closest('.msg-action-btn');
      if (copyBtn && copyBtn.textContent.includes('复制')) {
        this.handleCopy(copyBtn);
      }
    });
    
    // 回车发送
    const textarea = document.getElementById('chatTextarea');
    if (textarea) {
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSend();
        }
      });
    }
  }

  render() {
    this.renderConversations();
    this.renderCurrentChat();
  }

  renderConversations() {
    const convList = document.querySelector('.nav-scroll');
    if (!convList) return;
    
    const convs = this.store.getAllConversations();
    
    // 这里会更新对话列表
    // 完整实现会在后续完善
  }

  renderCurrentChat() {
    const content = document.getElementById('chatContent');
    if (!content) return;
    
    const conv = this.store.getCurrentConversation();
    if (!conv) return;
    
    // 渲染消息
    content.innerHTML = (conv.messages || []).map(msg => {
      const isUser = msg.role === 'user';
      return `
        <div class="message ${isUser ? 'user' : 'ai'}">
          <span class="message-label">${isUser ? 'you' : 'assistant'}</span>
          <div class="message-bubble">
            ${Security.sanitizeHtml(msg.content)}
          </div>
          <div class="msg-actions ${isUser ? 'user-actions' : 'ai-actions'}">
            <button class="msg-action-btn" title="复制">
              <svg viewBox="0 0 16 16" fill="currentColor" style="width:13px;height:13px;">
                <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2z"/>
              </svg>
              复制
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  handleNewChat() {
    this.store.createConversation('新对话');
    this.renderCurrentChat();
  }

  async handleSend() {
    const textarea = document.getElementById('chatTextarea');
    const content = textarea?.value?.trim();
    if (!content || this.isGenerating) return;
    
    let conv = this.store.getCurrentConversation();
    if (!conv) {
      conv = this.store.createConversation(content.slice(0, 30));
    }
    
    // 添加用户消息
    this.store.addMessage(conv.id, { role: 'user', content });
    textarea.value = '';
    this.renderCurrentChat();
    this.scrollToBottom();
    
    // 生成 AI 响应
    this.isGenerating = true;
    this.setSendButtonState(true);
    
    try {
      // 先使用模拟响应
      const aiContent = this.api.getSimulatedResponse(content);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.store.addMessage(conv.id, { role: 'assistant', content: aiContent });
      this.renderCurrentChat();
      
    } catch (error) {
      console.error('Chat error:', error);
      this.showToast(error.message || '发送失败');
    } finally {
      this.isGenerating = false;
      this.setSendButtonState(false);
      this.scrollToBottom();
    }
  }

  handleCopy(btn) {
    const msg = btn.closest('.message');
    const bubble = msg?.querySelector('.message-bubble');
    if (!bubble) return;
    
    navigator.clipboard.writeText(bubble.innerText).then(() => {
      const originalText = btn.innerHTML;
      btn.innerHTML = `
        <svg viewBox="0 0 16 16" fill="currentColor" style="width:13px;height:13px;">
          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
        </svg>
        已复制
      `;
      btn.classList.add('copied');
      
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('copied');
      }, 1500);
    });
  }

  setSendButtonState(stopping) {
    const btn = document.getElementById('sendBtn');
    if (!btn) return;
    
    if (stopping) {
      btn.classList.add('stopping');
      btn.title = '停止生成';
    } else {
      btn.classList.remove('stopping');
      btn.title = '发送 (Enter)';
    }
  }

  scrollToBottom() {
    const content = document.getElementById('chatContent');
    if (content) {
      content.scrollTop = content.scrollHeight;
    }
  }

  showToast(message) {
    // 简单的 toast
    const toast = document.createElement('div');
    toast.style.cssText = `
      position:fixed;bottom:32px;left:50%;transform:translateX(-50%);
      background:var(--color-surface);color:var(--color-text-primary);
      padding:12px 24px;border-radius:12px;
      box-shadow:0 8px 32px rgba(0,0,0,0.2);
      z-index:1000;border:1px solid var(--color-border);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 2500);
  }

  openSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
      modal.classList.add('open');
    }
  }
}

export default ChatUI;
