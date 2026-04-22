// Soul Nav - 新标签页主脚本

document.addEventListener('DOMContentLoaded', async () => {
  // ===== 常量声明 =====
  const BG_KEY = 'soul-nav-bg';
  const NAV_KEY = 'soul-nav-links';
  const SEARCH_ENGINE_KEY = 'soul-nav-search-engine';
  const THEME_KEY = 'soul-nav-theme';

  // ===== DOM 元素 =====
  const timeEl = document.getElementById('time');
  const dateEl = document.getElementById('date');
  const searchInput = document.getElementById('search-input');
  const searchIconBtn = document.getElementById('search-icon-btn');
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
  // 导出导入
  const exportBtn = document.getElementById('export-btn');
  const importBtn = document.getElementById('import-btn');
  const importFileInput = document.getElementById('import-file-input');
  const exportImportStatus = document.getElementById('export-import-status');
  // 搜索引擎
  const searchEngineSelector = document.getElementById('search-engine-selector');
  const searchEngineMenu = document.getElementById('search-engine-menu');
  const engineIcon = document.getElementById('engine-icon');
  // 主题
  const themeRadios = document.querySelectorAll('input[name="theme"]');
  // 导航区域
  const navSectionEl = document.getElementById('nav-section');

  console.log('[SoulNav] DOM 元素检查:');
  console.log('  - searchEngineSelector:', searchEngineSelector);
  console.log('  - searchEngineMenu:', searchEngineMenu);
  console.log('  - engineIcon:', engineIcon);

  // ===== 搜索引擎事件绑定（使用事件委托）=====
  document.addEventListener('click', (e) => {
    console.log('[Document] 点击事件:', e.target);

    // 点击搜索引擎选择按钮
    const selector = e.target.closest('#search-engine-selector');
    if (selector) {
      console.log('[SearchEngine] 点击了选择按钮');
      e.stopPropagation();
      searchEngineMenu.classList.toggle('hidden');
      const isHidden = searchEngineMenu.classList.contains('hidden');
      console.log('[SearchEngine] 菜单 hidden 状态:', isHidden);
      console.log('[SearchEngine] 菜单 display:', getComputedStyle(searchEngineMenu).display);
      console.log('[SearchEngine] 菜单 visibility:', getComputedStyle(searchEngineMenu).visibility);
      console.log('[SearchEngine] 菜单 z-index:', getComputedStyle(searchEngineMenu).zIndex);
      console.log('[SearchEngine] 菜单位置:', searchEngineMenu.getBoundingClientRect());
      return;
    }

    // 点击搜索引擎选项
    const option = e.target.closest('.engine-option');
    if (option && searchEngineMenu.contains(e.target)) {
      console.log('[SearchEngine] 点击了选项:', option.dataset.engine);
      const engine = option.dataset.engine;
      localStorage.setItem(SEARCH_ENGINE_KEY, engine);
      engineIcon.src = `https://favicon.im/${engineDomains[engine]}`;
      searchEngineMenu.classList.add('hidden');
      return;
    }

    // 点击其他地方关闭菜单
    if (!searchEngineMenu.contains(e.target)) {
      searchEngineMenu.classList.add('hidden');
    }
  });

  // ===== 变量声明 =====
  let navLinks = [];

  // 搜索引擎域名映射
  const engineDomains = {
    bing: 'bing.com',
    google: 'google.com',
    duckduckgo: 'duckduckgo.com',
    baidu: 'baidu.com',
    yandex: 'yandex.com'
  };

  // ===== 初始化语录管理器 =====
  const soulQuotes = new SoulQuotes();
  const initResult = await soulQuotes.init();

  console.log(`[SoulNav] 已加载 ${initResult.count} 条语录 (${initResult.source})`);

  // ===== 函数定义 =====

  // 显示新语录（顺序轮播）
  function showNewQuote() {
    const quote = soulQuotes.getNextQuote();
    quoteTextEl.style.opacity = '0';
    setTimeout(() => {
      quoteTextEl.textContent = quote;
      quoteTextEl.style.opacity = '1';
    }, 200);
  }

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

  // 设置面板控制
  function openSettings() {
    settingsPanel.classList.add('open');
    loadNavLinks();
  }

  function closeSettings() {
    settingsPanel.classList.remove('open');
  }

  // 背景图片管理
  function loadBackground() {
    const currentTheme = localStorage.getItem(THEME_KEY) || 'dark';
    if (currentTheme === 'custom') {
      const bgData = localStorage.getItem(BG_KEY);
      if (bgData) {
        document.getElementById('bg-layer').style.backgroundImage = `url(${bgData})`;
        document.getElementById('bg-layer').classList.add('has-image');
      }
    }
  }

  // 自定义导航管理
  function getDefaultNavLinks() {
    return [
      { name: 'GitHub', url: 'https://github.com' },
      { name: '知乎', url: 'https://zhihu.com' },
      { name: 'B站', url: 'https://bilibili.com' }
    ];
  }

  function loadNavLinks() {
    try {
      const stored = localStorage.getItem(NAV_KEY);
      navLinks = stored ? JSON.parse(stored) : getDefaultNavLinks();
    } catch {
      navLinks = getDefaultNavLinks();
    }
    renderNavGrid();
    renderNavList();
  }

  function saveNavLinks() {
    localStorage.setItem(NAV_KEY, JSON.stringify(navLinks));
  }

  function renderNavGrid() {
    if (!navGridEl) return;

    navGridEl.innerHTML = navLinks.map((link, index) => {
      const domain = new URL(link.url).hostname;
      return `
      <a href="${link.url}" class="nav-item" title="${link.name}" draggable="true" data-index="${index}" target="_blank" rel="noopener noreferrer">
        <img class="favicon" src="https://favicon.im/${domain}" alt="" loading="lazy">
        <span>${link.name}</span>
      </a>
    `}).join('');

    // 为图标添加错误处理
    navGridEl.querySelectorAll('.favicon').forEach(img => {
      img.addEventListener('error', function() {
        this.style.display = 'none';
      }, { once: true });
    });

    // 拖拽排序功能
    let draggedIndex = null;
    const navItems = navGridEl.querySelectorAll('.nav-item');

    navItems.forEach(item => {
      // 开始拖拽
      item.addEventListener('dragstart', (e) => {
        draggedIndex = parseInt(item.dataset.index);
        item.style.opacity = '0.5';
        item.style.transform = 'scale(0.95)';
        e.dataTransfer.effectAllowed = 'move';
      });

      // 拖拽经过
      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        const overIndex = parseInt(item.dataset.index);
        if (overIndex !== draggedIndex) {
          item.style.border = '2px dashed var(--accent-color)';
          item.style.background = 'var(--search-bg)';
        }
      });

      // 拖拽离开
      item.addEventListener('dragleave', () => {
        item.style.border = '';
        item.style.background = '';
      });

      // 放置
      item.addEventListener('drop', (e) => {
        e.preventDefault();
        const dropIndex = parseInt(item.dataset.index);

        if (dropIndex !== draggedIndex) {
          // 交换数组元素
          const [draggedItem] = navLinks.splice(draggedIndex, 1);
          navLinks.splice(dropIndex, 0, draggedItem);

          // 保存到localStorage并重新渲染
          localStorage.setItem(NAV_KEY, JSON.stringify(navLinks));
          renderNavGrid();
          renderNavList();
        }

        // 重置样式
        item.style.border = '';
        item.style.background = '';
      });

      // 拖拽结束
      item.addEventListener('dragend', () => {
        item.style.opacity = '';
        item.style.transform = '';
        draggedIndex = null;

        // 重置所有项的样式
        navItems.forEach(i => {
          i.style.border = '';
          i.style.background = '';
        });
      });
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

  // 搜索引擎
  function loadSearchEngine() {
    const savedEngine = localStorage.getItem(SEARCH_ENGINE_KEY) || 'bing';
    if (engineIcon) {
      engineIcon.src = `https://favicon.im/${engineDomains[savedEngine]}`;
    }
    // 初始化菜单中的图标
    const menuOptions = searchEngineMenu.querySelectorAll('.engine-option');
    menuOptions.forEach(option => {
      const engine = option.dataset.engine;
      const img = option.querySelector('.engine-icon');
      if (img) {
        img.src = `https://favicon.im/${engineDomains[engine]}`;
      }
    });
  }

  // 获取当前搜索引擎的搜索 URL
  function getSearchUrl(query) {
    const engine = localStorage.getItem(SEARCH_ENGINE_KEY) || 'bing';
    const encodedQuery = encodeURIComponent(query);

    switch (engine) {
      case 'google':
        return `https://www.google.com/search?q=${encodedQuery}`;
      case 'duckduckgo':
        return `https://duckduckgo.com/?q=${encodedQuery}`;
      case 'baidu':
        return `https://www.baidu.com/s?wd=${encodedQuery}`;
      case 'yandex':
        return `https://yandex.com/search/?text=${encodedQuery}`;
      case 'bing':
      default:
        return `https://www.bing.com/search?q=${encodedQuery}`;
    }
  }

  // 主题设置
  function applyTheme(theme) {
    document.body.classList.remove('custom-bg');
    document.documentElement.removeAttribute('data-theme');

    if (theme === 'custom') {
      document.body.classList.add('custom-bg');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }

    const bgLayer = document.getElementById('bg-layer');
    const customOptions = document.getElementById('theme-custom-options');

    if (!customOptions) return;

    // 显示/隐藏自定义背景选项
    if (theme === 'custom') {
      customOptions.classList.remove('hidden');
      // 如果有背景图片则显示
      const bgData = localStorage.getItem(BG_KEY);
      if (bgData) {
        bgLayer.style.backgroundImage = `url(${bgData})`;
        bgLayer.classList.add('has-image');
      }
    } else {
      customOptions.classList.add('hidden');
      // 非自定义主题时隐藏背景图片
      bgLayer.style.backgroundImage = '';
      bgLayer.classList.remove('has-image');
      document.body.style.background = 'var(--bg-gradient)';
    }
  }

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
      applyTheme('dark');
    }
  }

  // ===== 初始化 =====

  // 显示第一条语录
  showNewQuote();

  // 更新时间
  updateTime();
  setInterval(updateTime, 1000);

  // 点击语录切换
  quoteEl.addEventListener('click', showNewQuote);

  // 每5秒自动轮播
  setInterval(showNewQuote, 5000);

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

    soulFileInput.value = '';
  });

  // 背景图片
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
      // 自动切换到自定义背景主题
      localStorage.setItem(THEME_KEY, 'custom');
      themeRadios.forEach(radio => {
        radio.checked = radio.value === 'custom';
      });
      applyTheme('custom');
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

  // 初始化导航
  loadNavLinks();

  // 搜索引擎设置
  loadSearchEngine();

  // 主题设置
  loadTheme();

  // 监听主题切换
  themeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const theme = e.target.value;
      localStorage.setItem(THEME_KEY, theme);
      applyTheme(theme);
    });
  });

  // 执行搜索
  function executeSearch() {
    const query = searchInput.value.trim();
    if (query) {
      window.open(getSearchUrl(query), '_blank', 'noopener,noreferrer');
    }
  }

  // 搜索功能 - 回车键
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      executeSearch();
    }
  });

  // 搜索功能 - 点击搜索图标
  searchIconBtn.addEventListener('click', () => {
    executeSearch();
  });

  // 添加导航链接
  addNavBtn.addEventListener('click', () => {
    const name = navNameInput.value.trim();
    let url = navUrlInput.value.trim();

    if (!name || !url) {
      alert('请输入名称和网址');
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    navLinks.push({ name, url });
    saveNavLinks();
    renderNavList();
    renderNavGrid();

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

  // 应用启动器交互
  const appLauncherBtn = document.getElementById('app-launcher-btn');
  const appLauncherMenu = document.getElementById('app-launcher-menu');

  if (appLauncherBtn && appLauncherMenu) {
    appLauncherBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      appLauncherMenu.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!appLauncherMenu.contains(e.target) && e.target !== appLauncherBtn) {
        appLauncherMenu.classList.remove('active');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        appLauncherMenu.classList.remove('active');
      }
    });
  }

  console.log('[SoulNav] 初始化完成');
});
