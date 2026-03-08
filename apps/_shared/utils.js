// _shared/utils.js - 通用工具函数

const Utils = {
  // ========== 日期工具 ==========
  
  // 格式化日期
  formatDate(date, locale = 'zh-CN') {
    const d = new Date(date);
    return d.toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  },

  // 格式化为 ISO 日期 (YYYY-MM-DD)
  toISODate(date) {
    const d = new Date(date);
    return d.toISOString().slice(0, 10);
  },

  // 获取今天的 ISO 日期
  todayISO() {
    return this.toISODate(new Date());
  },

  // 日期偏移
  offsetDate(date, days = 0) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return this.toISODate(d);
  },

  // 计算两个日期之间的天数
  daysBetween(a, b) {
    const msPerDay = 24 * 60 * 60 * 1000;
    const dateA = new Date(a);
    const dateB = new Date(b);
    return Math.round((dateB - dateA) / msPerDay);
  },

  // ========== 格式化 ==========
  
  // 格式化时间 (HH:MM)
  formatTime(date) {
    const d = new Date(date);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  },

  // 格式化相对时间
  formatRelative(date, now = new Date()) {
    const diff = this.daysBetween(date, now);
    if (diff === 0) return '今天';
    if (diff === 1) return '昨天';
    if (diff === -1) return '明天';
    if (diff > 0 && diff < 7) return `${diff}天前`;
    if (diff < 0 && diff > -7) return `${-diff}天后`;
    return this.formatDate(date);
  },

  // 截断字符串
  truncate(str, maxLen = 50, suffix = '...') {
    if (!str) return '';
    return str.length > maxLen ? str.slice(0, maxLen) + suffix : str;
  },

  // ========== DOM 工具 ==========
  
  // 安全创建元素
  createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    
    // 设置属性
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'className') {
        el.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(el.style, value);
      } else if (key.startsWith('on')) {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === 'innerHTML') {
        el.innerHTML = value;
      } else if (key === 'textContent') {
        el.textContent = value;
      } else {
        el.setAttribute(key, value);
      }
    });
    
    // 添加子元素
    children.forEach(child => {
      if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        el.appendChild(child);
      }
    });
    
    return el;
  },

  // ========== 数组/对象工具 ==========
  
  // 生成唯一 ID
  uid(prefix = 'id') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  },

  // 深拷贝
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  // 防抖
  debounce(fn, delay = 300) {
    let timer = null;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  // 节流
  throttle(fn, delay = 300) {
    let last = 0;
    return function(...args) {
      const now = Date.now();
      if (now - last >= delay) {
        last = now;
        fn.apply(this, args);
      }
    };
  }
};

export default Utils;
