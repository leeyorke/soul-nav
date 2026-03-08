// _shared/storage.js - 统一存储封装
// 支持 localStorage 和 IndexedDB 双模式

class StorageWrapper {
  constructor(options = {}) {
    this.useIndexedDB = options.useIndexedDB || false;
    this.dbName = options.dbName || 'soul-nav-storage';
    this.dbVersion = options.dbVersion || 1;
    this.db = null;
  }

  // 初始化（如果使用 IndexedDB）
  async init() {
    if (!this.useIndexedDB) return true;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(true);
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 默认 store - key-value 存储
        if (!db.objectStoreNames.contains('kv')) {
          db.createObjectStore('kv');
        }
      };
    });
  }

  // ========== localStorage 模式 ==========
  
  // 获取值
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (e) {
      console.warn('Storage.get error:', e);
      return defaultValue;
    }
  }

  // 设置值
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('Storage.set error:', e);
      return false;
    }
  }

  // 删除值
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn('Storage.remove error:', e);
      return false;
    }
  }

  // 清空所有
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.warn('Storage.clear error:', e);
      return false;
    }
  }

  // ========== IndexedDB 模式（可选）==========
  
  async idbGet(key, storeName = 'kv') {
    if (!this.db) throw new Error('IndexedDB not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async idbSet(key, value, storeName = 'kv') {
    if (!this.db) throw new Error('IndexedDB not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(value, key);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async idbRemove(key, storeName = 'kv') {
    if (!this.db) throw new Error('IndexedDB not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async idbGetAll(storeName = 'kv') {
    if (!this.db) throw new Error('IndexedDB not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// 导出单例
export const storage = new StorageWrapper();
export default StorageWrapper;
