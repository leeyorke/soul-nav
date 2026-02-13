// Soul Nav - 新标签页主脚本

document.addEventListener('DOMContentLoaded', async () => {
  // 初始化语录管理器
  const soulQuotes = new SoulQuotes();
  await soulQuotes.init();
  
  console.log(`[SoulNav] 已加载 ${soulQuotes.count} 条语录`);
  
  // DOM 元素
  const timeEl = document.getElementById('time');
  const dateEl = document.getElementById('date');
  const searchInput = document.getElementById('search-input');
  const quoteEl = document.getElementById('soul-quote');
  const quoteTextEl = quoteEl.querySelector('.quote-text');
  
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
  
  // 显示新语录
  function showNewQuote() {
    const quote = soulQuotes.getRandomQuote();
    
    // 淡出效果
    quoteTextEl.style.opacity = '0';
    
    setTimeout(() => {
      quoteTextEl.textContent = quote;
      quoteTextEl.style.opacity = '1';
    }, 300);
  }
  
  // 初始化显示第一条语录
  showNewQuote();
  
  // 点击语录区域切换
  quoteEl.addEventListener('click', showNewQuote);
  
  // 搜索功能
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        // 判断是否为URL
        const urlPattern = /^(https?:\/\/)?([\w.-]+)([\/\w.-]*)\/?$/;
        const isUrl = urlPattern.test(query) || query.includes('.') && !query.includes(' ');
        
        if (isUrl && (query.startsWith('http') || query.includes('.'))) {
          // 直接访问URL
          const url = query.startsWith('http') ? query : `https://${query}`;
          window.location.href = url;
        } else {
          // 使用 Bing 搜索
          const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
          window.location.href = searchUrl;
        }
      }
    }
  });
  
  // 聚焦搜索框
  searchInput.focus();
  
  // 键盘快捷键
  document.addEventListener('keydown', (e) => {
    // ESC 清空搜索框
    if (e.key === 'Escape') {
      searchInput.value = '';
      searchInput.focus();
    }
    
    // 空格键切换语录（仅在搜索框未聚焦时）
    if (e.key === ' ' && document.activeElement !== searchInput) {
      e.preventDefault();
      showNewQuote();
    }
  });
  
  console.log('[SoulNav] 初始化完成');
});
