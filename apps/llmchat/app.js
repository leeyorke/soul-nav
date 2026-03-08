// llmchat/app.js - 应用入口
import ChatStore from './modules/store.js';
import ApiClient from './modules/api.js';
import ChatUI from './modules/ui.js';

class LLMChatApp {
  constructor() {
    this.store = new ChatStore();
    this.api = new ApiClient(this.store);
    this.ui = new ChatUI(this.store, this.api);
    this.init();
  }

  async init() {
    console.log('[LLMChat] Initializing...');
    console.log('[LLMChat] Ready');
  }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
  window.app = new LLMChatApp();
});
