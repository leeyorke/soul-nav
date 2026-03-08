// app.js - 新 APP 模板入口
import { storage } from '../_shared/storage.js';
import Security from '../_shared/security.js';
import Utils from '../_shared/utils.js';

class NewApp {
  constructor() {
    this.init();
  }

  async init() {
    console.log('[NewApp] Initializing...');
    this.render();
    console.log('[NewApp] Ready');
  }

  render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="card" style="margin: 20px;">
        <h1>New App Template</h1>
        <p style="color: var(--color-text-secondary); margin-top: 8px;">
          This is a template for new Soul Nav apps.
        </p>
        <button class="btn btn-primary" style="margin-top: 16px;">
          Click Me
        </button>
      </div>
    `;
    
    app.querySelector('button').addEventListener('click', () => {
      alert('Hello from template!');
    });
  }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
  window.app = new NewApp();
});
