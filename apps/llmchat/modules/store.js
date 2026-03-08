// llmchat/modules/store.js - ChatStore 类
import { storage } from '../../_shared/storage.js';
import Utils from '../../_shared/utils.js';

const CONVERSATIONS_KEY = 'llmchat-conversations';
const SETTINGS_KEY = 'llmchat-settings';

class ChatStore {
  constructor() {
    this.conversations = [];
    this.currentConvId = null;
    this.settings = this.loadSettings();
    this.listeners = [];
    this.loadFromStorage();
  }

  // ========== 事件监听 ==========
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => cb(this.conversations, this.currentConvId));
  }

  // ========== 存储 ==========
  loadFromStorage() {
    const data = storage.get(CONVERSATIONS_KEY, []);
    this.conversations = Array.isArray(data) ? data : [];
    return this.conversations;
  }

  saveToStorage() {
    storage.set(CONVERSATIONS_KEY, this.conversations);
    this.notify();
  }

  loadSettings() {
    return storage.get(SETTINGS_KEY, {
      defaultModel: 'gpt-4-turbo',
      temperature: 0.7,
      maxTokens: 2048,
      providers: []
    });
  }

  saveSettings(settings) {
    this.settings = { ...this.settings, ...settings };
    storage.set(SETTINGS_KEY, this.settings);
  }

  // ========== 会话 CRUD ==========
  getAllConversations() {
    return [...this.conversations];
  }

  getConversation(id) {
    return this.conversations.find(c => c.id === id);
  }

  getCurrentConversation() {
    return this.getConversation(this.currentConvId);
  }

  setCurrentConversation(id) {
    this.currentConvId = id;
    this.notify();
  }

  createConversation(title = '新对话') {
    const conv = {
      id: Utils.uid('conv'),
      title,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tag: null
    };
    
    this.conversations.unshift(conv);
    this.currentConvId = conv.id;
    this.saveToStorage();
    return conv;
  }

  updateConversation(id, updates) {
    const index = this.conversations.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    this.conversations[index] = {
      ...this.conversations[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.saveToStorage();
    return this.conversations[index];
  }

  deleteConversation(id) {
    const index = this.conversations.findIndex(c => c.id === id);
    if (index === -1) return false;
    
    this.conversations.splice(index, 1);
    
    if (this.currentConvId === id) {
      this.currentConvId = this.conversations[0]?.id || null;
    }
    
    this.saveToStorage();
    return true;
  }

  // ========== 消息操作 ==========
  addMessage(convId, message) {
    const conv = this.getConversation(convId);
    if (!conv) return null;
    
    const msg = {
      id: Utils.uid('msg'),
      role: message.role || 'user',
      content: message.content,
      timestamp: new Date().toISOString(),
      ...message
    };
    
    if (!conv.messages) conv.messages = [];
    conv.messages.push(msg);
    
    this.updateConversation(convId, { messages: conv.messages });
    return msg;
  }

  updateMessage(convId, msgId, updates) {
    const conv = this.getConversation(convId);
    if (!conv) return null;
    
    const index = conv.messages.findIndex(m => m.id === msgId);
    if (index === -1) return null;
    
    conv.messages[index] = { ...conv.messages[index], ...updates };
    this.updateConversation(convId, { messages: conv.messages });
    return conv.messages[index];
  }

  deleteMessage(convId, msgId) {
    const conv = this.getConversation(convId);
    if (!conv) return false;
    
    const index = conv.messages.findIndex(m => m.id === msgId);
    if (index === -1) return false;
    
    conv.messages.splice(index, 1);
    this.updateConversation(convId, { messages: conv.messages });
    return true;
  }

  // ========== 标签操作 ==========
  setConversationTag(convId, tag) {
    return this.updateConversation(convId, { tag });
  }

  getConversationsByTag(tag) {
    return this.conversations.filter(c => c.tag === tag);
  }

  // ========== 导出/导入 ==========
  exportConversation(convId) {
    const conv = this.getConversation(convId);
    if (!conv) return null;
    
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      conversation: conv
    };
  }

  importConversation(data) {
    if (!data || !data.conversation) {
      throw new Error('Invalid data format');
    }
    
    const conv = {
      ...data.conversation,
      id: Utils.uid('conv'),
      importedAt: new Date().toISOString()
    };
    
    this.conversations.unshift(conv);
    this.saveToStorage();
    return conv;
  }
}

export default ChatStore;
