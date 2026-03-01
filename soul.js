// Soul Nav - 语录管理模块
// 支持从本地存储加载，或从用户上传的 soul.md 文件加载

const DEFAULT_SOUL_QUOTES = [
  "Be genuinely helpful, not performatively helpful.",
  "Have opinions. An assistant with no personality is just a search engine.",
  "Be resourceful before asking.",
  "成为你自己。",
  "少说废话，多做实事。",
  "Text > Brain —— 写下来，比记在脑子里更可靠。"
];

class SoulQuotes {
  constructor() {
    this.quotes = [];
    this.currentIndex = -1;
    this.storageKey = 'soul-nav-quotes';
    this.sourceKey = 'soul-nav-source'; // 'default' | 'file'
    this.hasLoadedFromFile = false;
  }

  async init() {
    // 优先从 localStorage 加载
    const stored = this.loadFromStorage();
    
    if (stored && stored.length > 0) {
      this.quotes = stored;
      const source = localStorage.getItem(this.sourceKey) || 'default';
      console.log(`[SoulNav] 从存储加载 ${this.quotes.length} 条语录 (${source})`);
      return { count: this.quotes.length, source };
    } else {
      // 使用默认语录
      this.quotes = [...DEFAULT_SOUL_QUOTES];
      this.saveToStorage('default');
      console.log(`[SoulNav] 使用默认语录 ${this.quotes.length} 条`);
      return { count: this.quotes.length, source: 'default' };
    }
  }

  // 从文件加载语录 (用户上传的 soul.md 或其他格式)
  loadFromFile(content, filename) {
    const quotes = this.parseQuotes(content, filename);
    
    if (quotes.length > 0) {
      this.quotes = quotes;
      this.currentIndex = -1;
      this.hasLoadedFromFile = true;
      this.saveToStorage('file');
      console.log(`[SoulNav] 从文件加载 ${quotes.length} 条语录: ${filename}`);
      return { success: true, count: quotes.length };
    } else {
      return { success: false, error: '未能解析出有效语录' };
    }
  }

  // 解析不同格式的语录文件
  parseQuotes(content, filename) {
    const quotes = [];
    const ext = filename.split('.').pop().toLowerCase();
    
    if (ext === 'json') {
      try {
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          return data.filter(q => typeof q === 'string' && q.trim());
        } else if (data.quotes && Array.isArray(data.quotes)) {
          return data.quotes.filter(q => typeof q === 'string' && q.trim());
        }
      } catch (e) {
        console.error('JSON 解析失败:', e);
        return [];
      }
    }
    
    // 解析 MD/TXT 文件
    const lines = content.split('\n');
    let currentQuote = '';
    let inCodeBlock = false;
    
    for (let line of lines) {
      const trimmed = line.trim();
      
      // 跳过代码块
      if (trimmed.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (inCodeBlock) continue;
      
      // 跳过空行、标题、注释
      if (!trimmed || 
          trimmed.startsWith('#') || 
          trimmed.startsWith('<!--') || 
          trimmed.startsWith('//')) {
        if (currentQuote.length > 0) {
          quotes.push(currentQuote.trim());
        }
        currentQuote = '';
        continue;
      }

      // 解析列表项或纯文本
      let text = trimmed;
      if (text.startsWith('- ') || text.startsWith('* ')) {
        if (currentQuote.length > 0) {
          quotes.push(currentQuote.trim());
        }
        currentQuote = text.substring(2);
      } else if (text.startsWith('"') && text.endsWith('"')) {
        quotes.push(text.slice(1, -1));
        currentQuote = '';
      } else {
        currentQuote += (currentQuote ? ' ' : '') + text;
      }
    }
    
    if (currentQuote.length > 0) {
      quotes.push(currentQuote.trim());
    }

    return quotes.filter(q => q.length > 0);
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  saveToStorage(source = 'default') {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.quotes));
      localStorage.setItem(this.sourceKey, source);
    } catch (e) {
      console.warn('localStorage 保存失败:', e);
    }
  }

  getRandomQuote() {
    if (this.quotes.length === 0) {
      return "点击加载 Soul 语录...";
    }

    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.quotes.length);
    } while (newIndex === this.currentIndex && this.quotes.length > 1);

    this.currentIndex = newIndex;
    return this.quotes[newIndex];
  }

  getNextQuote() {
    if (this.quotes.length === 0) {
      return "点击加载 Soul 语录...";
    }
    this.currentIndex = (this.currentIndex + 1) % this.quotes.length;
    return this.quotes[this.currentIndex];
  }

  get count() {
    return this.quotes.length;
  }

  clearStorage() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.sourceKey);
    this.quotes = [...DEFAULT_SOUL_QUOTES];
    this.currentIndex = -1;
  }
}

// 兼容模块导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SoulQuotes;
}

// 浏览器环境：暴露到全局作用域
if (typeof window !== 'undefined') {
  window.SoulQuotes = SoulQuotes;
}
