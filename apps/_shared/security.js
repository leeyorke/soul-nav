// _shared/security.js - 安全工具
// XSS 防护、输入验证、数据净化等

const Security = {
  // ========== XSS 防护 ==========
  
  // 净化 HTML（基础版本 - 生产环境建议使用 DOMPurify）
  sanitizeHtml(html) {
    const tempDiv = document.createElement('div');
    tempDiv.textContent = html;
    return tempDiv.innerHTML;
  },

  // 净化属性值
  sanitizeAttribute(value) {
    return String(value)
      .replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char]));
  },

  // 安全地设置 innerHTML
  safeInnerHTML(element, html, options = {}) {
    if (options.useDOMPurify && window.DOMPurify) {
      element.innerHTML = DOMPurify.sanitize(html);
    } else {
      // 降级方案 - 只允许纯文本
      element.textContent = html;
    }
    return element;
  },

  // ========== 输入验证 ==========
  
  // 验证字符串长度
  validateLength(str, min = 0, max = Infinity) {
    const len = String(str).length;
    return len >= min && len <= max;
  },

  // 验证 URL
  validateUrl(url, allowedProtocols = ['http:', 'https:']) {
    try {
      const urlObj = new URL(url);
      return allowedProtocols.includes(urlObj.protocol);
    } catch {
      return false;
    }
  },

  // 验证邮箱
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email));
  },

  // 验证整数
  validateInt(value, min = -Infinity, max = Infinity) {
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= min && num <= max;
  },

  // ========== 数据安全 ==========
  
  // 简单的混淆（不是加密！只用于防偷窥）
  obfuscate(str) {
    return btoa(encodeURIComponent(str)
      .split('')
      .map((c, i) => String.fromCharCode(c.charCodeAt(0) + (i % 5 + 1)))
      .join(''));
  },

  deobfuscate(str) {
    try {
      return decodeURIComponent(
        atob(str)
          .split('')
          .map((c, i) => String.fromCharCode(c.charCodeAt(0) - (i % 5 + 1)))
          .join('')
      );
    } catch {
      return '';
    }
  },

  // 安全存储 API Key（仅用于浏览器扩展）
  async secureStore(key, value, useExtensionStorage = false) {
    if (useExtensionStorage && chrome?.storage?.local) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.set({ [key]: this.obfuscate(value) }, () => {
          if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
          else resolve(true);
        });
      });
    } else {
      // 降级到 localStorage + 混淆
      return localStorage.setItem(key, this.obfuscate(value));
    }
  },

  async secureGet(key, useExtensionStorage = false) {
    if (useExtensionStorage && chrome?.storage?.local) {
      return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
          resolve(result[key] ? this.deobfuscate(result[key]) : null);
        });
      });
    } else {
      const value = localStorage.getItem(key);
      return value ? this.deobfuscate(value) : null;
    }
  }
};

export default Security;
