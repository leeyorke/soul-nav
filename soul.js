// SOUL 语录库 - 可配置的语录数据
// 支持从外部 soul.md 文件加载，内置默认语录作为 fallback

const DEFAULT_SOUL_QUOTES = [
  // 来自项目 SOUL.md 的核心精神
  "Be genuinely helpful, not performatively helpful. Actions speak louder than filler words.",
  "Have opinions. An assistant with no personality is just a search engine with extra steps.",
  "Be resourceful before asking. Try to figure it out. Then ask if you're stuck.",
  "Earn trust through competence. Be careful with external actions. Be bold with internal ones.",
  "Remember you're a guest. Treat it with respect.",
  
  // 中文语录
  "成为你自己。",
  "少说废话，多做实事。",
  "有主见的助手，才有灵魂。",
  "先尝试，再问。",
  "能力赢得信任。",
  "你是客人，要有礼貌。",
  
  // 更多思考
  "Text > Brain —— 写下来，比记在脑子里更可靠。",
  "每次醒来都是新的，文件才是你的记忆。",
  "质量 > 数量。",
  "有用的背景工作，胜过烦人的打扰。"
];

// SoulQuotes 类 - 管理语录加载和展示
class SoulQuotes {
  constructor() {
    this.quotes = [];
    this.currentIndex = -1;
    this.storageKey = 'soul-nav-quotes';
    this.lastUpdateKey = 'soul-nav-last-update';
  }

  // 初始化 - 加载语录
  async init() {
    // 首先尝试从存储加载
    const stored = this.loadFromStorage();
    
    if (stored && stored.length > 0) {
      this.quotes = stored;
    } else {
      // 使用默认语录
      this.quotes = [...DEFAULT_SOUL_QUOTES];
      this.saveToStorage();
    }

    // 尝试从外部文件加载（如果存在）
    await this.tryLoadExternal();
  }

  // 从外部 soul.md 或 soul.json 加载
  async tryLoadExternal() {
    const files = ['soul.json', 'soul.md', 'soul.txt'];
    
    for (const file of files) {
      try {
        const response = await fetch(file);
        if (response.ok) {
          const content = await response.text();
          const quotes = this.parseQuotes(content, file);
          
          if (quotes.length > 0) {
            this.quotes = quotes;
            this.saveToStorage();
            console.log(`[SoulNav] Loaded ${quotes.length} quotes from ${file}`);
            return;
          }
        }
      } catch (e) {
        // 静默失败，继续尝试下一个文件
      }
    }
  }

  // 解析不同格式的语录
  parseQuotes(content, filename) {
    const quotes = [];
    
    if (filename.endsWith('.json')) {
      try {
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          return data.filter(q => typeof q === 'string' && q.trim());
        } else if (data.quotes && Array.isArray(data.quotes)) {
          return data.quotes.filter(q => typeof q === 'string' && q.trim());
        }
      } catch (e) {
        return [];
      }
    }
    
    // Markdown 或纯文本解析
    const lines = content.split('\n');
    let currentQuote = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // 跳过空行和注释
      if (!trimmed || trimmed.startsWith('<!--') || trimmed.startsWith('//') || trimmed.startsWith('#')) {
        if (currentQuote) {
          quotes.push(currentQuote.trim());
          currentQuote = '';
        }
        continue;
      }
      
      // 收集语录
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (currentQuote) {
          quotes.push(currentQuote.trim());
        }
        currentQuote = trimmed.substring(2);
      } else if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        quotes.push(trimmed.slice(1, -1));
      } else {
        currentQuote += (currentQuote ? ' ' : '') + trimmed;
      }
    }
    
    if (currentQuote) {
      quotes.push(currentQuote.trim());
    }
    
    return quotes.filter(q => q.length > 5);
  }

  // 从 localStorage 加载
  loadFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  // 保存到 localStorage
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.quotes));
      localStorage.setItem(this.lastUpdateKey, Date.now().toString());
    } catch (e) {
      // 存储失败（可能是隐私模式）
    }
  }

  // 获取随机语录
  getRandomQuote() {
    if (this.quotes.length === 0) {
      return "Be yourself.";
    }
    
    // 避免连续重复
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.quotes.length);
    } while (newIndex === this.currentIndex && this.quotes.length > 1);
    
    this.currentIndex = newIndex;
    return this.quotes[newIndex];
  }

  // 获取当前语录数量
  get count() {
    return this.quotes.length;
  }
}

// 导出（用于模块环境）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SoulQuotes;
}
