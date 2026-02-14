// Soul Nav - 新标签页主脚本

document.addEventListener('DOMContentLoaded', async () => {
  // DOM 元素
  const timeEl = document.getElementById('time');
  const dateEl = document.getElementById('date');
  const searchInput = document.getElementById('search-input');
  const quoteEl = document.getElementById('soul-quote');
  const quoteTextEl = quoteEl.querySelector('.quote-text');
  // 设置面板元素
  const settingsBtn = document.getElementById('settings-btn');
  const settingsPanel = document.getElementById('settings-panel');
  const closeSettingsBtn = document.getElementById('close-settings');
  const soulFileInput = document.getElementById('soul-file-input');
  const loadSoulBtn = document.getElementById('load-soul-btn');
  const soulStatus = document.getElementById('soul-status');
  const bgFileInput = document.getElementById('bg-file-input');
  const loadBgBtn = document.getElementById('load-bg-btn');
  const clearBgBtn = document.getElementById('clear-bg-btn');
  const bgStatus = document.getElementById('bg-status');
  const navNameInput = document.getElementById('nav-name');
  const navUrlInput = document.getElementById('nav-url');
  const addNavBtn = document.getElementById('add-nav-btn');
  const navListEl = document.getElementById('nav-list');
  const navGridEl = document.getElementById('nav-grid');

  // 初始化语录管理器
  const soulQuotes = new SoulQuotes();
  const initResult = await soulQuotes.init();

  console.log(`[SoulNav] 已加载 ${initResult.count} 条语录 (${initResult.source})`);

  // 显示第一条语录
  showNewQuote();

  // 更新时间
  function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeEl.textContent = `${hours}:${minutes}`;

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekDay = weekDays[now.getDay()];

    dateEl.textContent = `${year}/${month}/${day} ${weekDay}`;
  }

  updateTime();
  setInterval(updateTime, 1000);

  // 显示新语录（顺序轮播）
  function showNewQuote() {
    const quote = soulQuotes.getNextQuote();
    quoteTextEl.style.opacity = '0';
    setTimeout(() => {
      quoteTextEl.textContent = quote;
      quoteTextEl.style.opacity = '1';
    }, 200);
  }

  // 点击语录切换
  quoteEl.addEventListener('click', showNewQuote);

  // 每5秒自动轮播
  setInterval(showNewQuote, 5000);

  // 搜索功能
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        const urlPattern = /^(https?:\/\/)?([\w.-]+)([\/\w.-]*)\/?$/;
        const isUrl = urlPattern.test(query) || (query.includes('.') && !query.includes(' '));

        if (isUrl && (query.startsWith('http') || query.includes('.'))) {
          const url = query.startsWith('http') ? query : `https://${query}`;
          window.location.href = url;
        } else {
          const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
          window.location.href = searchUrl;
        }
      }
    }
  });

  // 设置面板控制
  function openSettings() {
    settingsPanel.classList.add('open');
    loadNavLinks();
  }

  function closeSettings() {
    settingsPanel.classList.remove('open');
  }

  // 设置按钮切换侧栏
  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (settingsPanel.classList.contains('open')) {
      closeSettings();
    } else {
      openSettings();
    }
  });

  closeSettingsBtn.addEventListener('click', closeSettings);

  // 点击面板外部关闭
  document.addEventListener('click', (e) => {
    if (settingsPanel.classList.contains('open') &&
        !settingsPanel.contains(e.target)) {
      closeSettings();
    }
  });

  // 加载 Soul 文件
  loadSoulBtn.addEventListener('click', () => soulFileInput.click());

  soulFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const content = await file.text();
      const result = soulQuotes.loadFromFile(content, file.name);

      if (result.success) {
        soulStatus.textContent = `✓ 已加载 ${result.count} 条语录`;
        soulStatus.style.color = '#58a6ff';
        showNewQuote();
      } else {
        soulStatus.textContent = '✗ ' + result.error;
        soulStatus.style.color = '#f85149';
      }
    } catch (err) {
      soulStatus.textContent = '✗ 读取文件失败';
      soulStatus.style.color = '#f85149';
    }

    // 重置文件输入
    soulFileInput.value = '';
  });

  // 背景图片管理
  const BG_KEY = 'soul-nav-bg';

  function loadBackground() {
    const bgData = localStorage.getItem(BG_KEY);
    if (bgData) {
      document.getElementById('bg-layer').style.backgroundImage = `url(${bgData})`;
      document.getElementById('bg-layer').classList.add('has-image');
    }
  }

  loadBackground();

  loadBgBtn.addEventListener('click', () => bgFileInput.click());

  bgFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      bgStatus.textContent = '✗ 图片太大，请选小于 5MB 的';
      bgStatus.style.color = '#f85149';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      localStorage.setItem(BG_KEY, dataUrl);
      document.getElementById('bg-layer').style.backgroundImage = `url(${dataUrl})`;
      document.getElementById('bg-layer').classList.add('has-image');
      bgStatus.textContent = '✓ 背景已设置';
      bgStatus.style.color = '#58a6ff';
    };
    reader.onerror = () => {
      bgStatus.textContent = '✗ 读取图片失败';
      bgStatus.style.color = '#f85149';
    };
    reader.readAsDataURL(file);

    bgFileInput.value = '';
  });

  clearBgBtn.addEventListener('click', () => {
    localStorage.removeItem(BG_KEY);
    document.getElementById('bg-layer').style.backgroundImage = '';
    document.getElementById('bg-layer').classList.remove('has-image');
    bgStatus.textContent = '✓ 背景已清除';
    bgStatus.style.color = '#58a6ff';
  });

  // 导出/导入功能
  const exportBtn = document.getElementById('export-btn');
  const importBtn = document.getElementById('import-btn');
  const importFileInput = document.getElementById('import-file-input');
  const exportImportStatus = document.getElementById('export-import-status');

  exportBtn.addEventListener('click', () => {
    const data = {
      quotes: localStorage.getItem('soul-nav-quotes'),
      quoteSource: localStorage.getItem('soul-nav-source'),
      background: localStorage.getItem('soul-nav-bg'),
      links: localStorage.getItem('soul-nav-links'),
      searchEngine: localStorage.getItem('soul-nav-search-engine'),
      theme: localStorage.getItem('soul-nav-theme'),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soul-nav-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    exportImportStatus.textContent = '✓ 设置已导出';
    exportImportStatus.style.color = '#58a6ff';
  });

  importBtn.addEventListener('click', () => importFileInput.click());

  importFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const content = await file.text();
      const data = JSON.parse(content);

      if (data.quotes) localStorage.setItem('soul-nav-quotes', data.quotes);
      if (data.quoteSource) localStorage.setItem('soul-nav-source', data.quoteSource);
      if (data.background) localStorage.setItem('soul-nav-bg', data.background);
      if (data.links) localStorage.setItem('soul-nav-links', data.links);
      if (data.searchEngine) localStorage.setItem('soul-nav-search-engine', data.searchEngine);
      if (data.theme) localStorage.setItem('soul-nav-theme', data.theme);

      exportImportStatus.textContent = '✓ 设置已导入，刷新页面生效';
      exportImportStatus.style.color = '#58a6ff';

      setTimeout(() => location.reload(), 1500);
    } catch (err) {
      exportImportStatus.textContent = '✗ 导入失败：文件格式错误';
      exportImportStatus.style.color = '#f85149';
    }

    importFileInput.value = '';
  });

  // 自定义导航管理
  const NAV_KEY = 'soul-nav-links';
  let navLinks = [];

  function loadNavLinks() {
    try {
      const stored = localStorage.getItem(NAV_KEY);
      navLinks = stored ? JSON.parse(stored) : getDefaultNavLinks();
    } catch {
      navLinks = getDefaultNavLinks();
    }
    renderNavGrid();
  }

  function getDefaultNavLinks() {
    return [
      { name: 'GitHub', url: 'https://github.com' },
      { name: '知乎', url: 'https://zhihu.com' },
      { name: 'B站', url: 'https://bilibili.com' }
    ];
  }

  function saveNavLinks() {
    localStorage.setItem(NAV_KEY, JSON.stringify(navLinks));
  }

  function renderNavGrid() {
    if (!navGridEl) return;

    // <img class="favicon" src="https://favicon.im/${domain}" alt="" loading="lazy">
    navGridEl.innerHTML = navLinks.map((link, index) => {
      const domain = new URL(link.url).hostname;
      return `
      <a href="${link.url}" class="nav-item" title="${link.name}" data-index="${index}">
        <img class="favicon" src="https://favicon.im/${domain}" alt="" loading="lazy">
        <span>${link.name}</span>
      </a>
    `}).join('');

    // 为图标添加错误处理（CSP 兼容方式）
    navGridEl.querySelectorAll('.favicon').forEach(img => {
      img.addEventListener('error', function() {
        this.style.display = 'none';
      }, { once: true });
    });
  }

  function renderNavList() {
    if (!navListEl) return;

    if (navLinks.length === 0) {
      navListEl.innerHTML = '<p class="empty">暂无导航链接</p>';
      return;
    }

    navListEl.innerHTML = navLinks.map((link, index) => `
      <div class="nav-list-item">
        <span class="nav-name">${link.name}</span>
        <button class="btn-icon" data-index="${index}" title="删除">&times;</button>
      </div>
    `).join('');

    // 绑定删除事件
    navListEl.querySelectorAll('.btn-icon').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        navLinks.splice(index, 1);
        saveNavLinks();
        renderNavList();
        renderNavGrid();
      });
    });
  }

  // 初始化导航
  loadNavLinks();

  // ===== 搜索引擎设置 =====
  const SEARCH_ENGINE_KEY = 'soul-nav-search-engine';
  const searchEngineRadios = document.querySelectorAll('input[name="search-engine"]');

  // 加载保存的搜索引擎设置
  const savedSearchEngine = localStorage.getItem(SEARCH_ENGINE_KEY) || 'bing';
  searchEngineRadios.forEach(radio => {
    if (radio.value === savedSearchEngine) {
      radio.checked = true;
    }
  });

  // 监听搜索引擎切换
  searchEngineRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      localStorage.setItem(SEARCH_ENGINE_KEY, e.target.value);
    });
  });

  // 获取当前搜索引擎的搜索 URL
  function getSearchUrl(query) {
    const engine = localStorage.getItem(SEARCH_ENGINE_KEY) || 'bing';
    const encodedQuery = encodeURIComponent(query);

    switch (engine) {
      case 'google':
        return `https://www.google.com/search?q=${encodedQuery}`;
      case 'duckduckgo':
        return `https://duckduckgo.com/?q=${encodedQuery}`;
      case 'bing':
      default:
        return `https://www.bing.com/search?q=${encodedQuery}`;
    }
  }

  // ===== 主题设置 =====
  const THEME_KEY = 'soul-nav-theme';
  const themeRadios = document.querySelectorAll('input[name="theme"]');

  // 应用主题
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    // 根据主题设置更新 body 背景
    if (theme === 'light') {
      document.body.style.background = 'var(--bg-gradient)';
    } else if (theme === 'dark') {
      document.body.style.background = 'var(--bg-gradient)';
    }
  }

  // 加载保存的主题设置
  function loadTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme) {
      applyTheme(savedTheme);
      themeRadios.forEach(radio => {
        if (radio.value === savedTheme) {
          radio.checked = true;
        }
      });
    } else {
      // 默认使用 dark 主题
      applyTheme('dark');
    }
  }

  // 监听主题切换
  themeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const theme = e.target.value;
      localStorage.setItem(THEME_KEY, theme);
      applyTheme(theme);
    });
  });

  // 初始化主题
  loadTheme();

  // ===== 搜索功能 =====
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        const urlPattern = /^(https?:\/\/)?([\w.-]+)([\/\w.-]*)\/?$/;
        const isUrl = urlPattern.test(query) || (query.includes('.') && !query.includes(' '));

        if (isUrl && (query.startsWith('http') || query.includes('.'))) {
          const url = query.startsWith('http') ? query : `https://${query}`;
          window.location.href = url;
        } else {
          // 使用用户选择的搜索引擎
          window.location.href = getSearchUrl(query);
        }
      }
    }
  });

  // 添加导航链接
  addNavBtn.addEventListener('click', () => {
    const name = navNameInput.value.trim();
    let url = navUrlInput.value.trim();

    if (!name || !url) {
      alert('请输入名称和网址');
      return;
    }

    // 自动添加 https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    navLinks.push({ name, url });
    saveNavLinks();
    renderNavList();
    renderNavGrid();

    // 清空输入
    navNameInput.value = '';
    navUrlInput.value = '';
  });

  // 键盘快捷键
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (settingsPanel.classList.contains('open')) {
        closeSettings();
      } else {
        searchInput.value = '';
        searchInput.focus();
      }
    }

    if (e.key === ' ' && document.activeElement !== searchInput && !settingsPanel.classList.contains('open')) {
      e.preventDefault();
      showNewQuote();
    }
  });

  console.log('[SoulNav] 初始化完成');
});
