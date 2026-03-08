// habit-tracker/modules/ui.js - HabitUI 类
import Security from '../../_shared/security.js';
import Utils from '../../_shared/utils.js';

class HabitUI {
  constructor(store, manager) {
    this.store = store;
    this.manager = manager;
    this.calOffset = 0;
    this.currentFreq = 'daily';
    this.selectedDays = [];
    
    // 订阅数据变化
    this.store.subscribe(() => this.render());
  }

  init() {
    this.bindEvents();
    this.render();
  }

  // ========== 事件绑定 ==========
  bindEvents() {
    document.addEventListener('click', (e) => {
      // 习惯完成按钮
      const checkBtn = e.target.closest('.check-btn');
      if (checkBtn) {
        const card = checkBtn.closest('.habit-card');
        if (card) {
          const id = card.dataset.id;
          const type = card.dataset.type;
          this.handleCompletion(id, type);
        }
      }
      
      // 年度月份点击
      const monthDot = e.target.closest('.month-dot');
      if (monthDot && monthDot.dataset.hid) {
        this.handleYearlyCompletion(monthDot.dataset.hid);
      }
      
      // 添加习惯
      const addBtn = e.target.closest('#btn-add');
      if (addBtn) {
        this.addHabit();
      }
      
      // 频率切换
      const freqBtn = e.target.closest('.freq-btn');
      if (freqBtn) {
        this.setFreq(freqBtn.dataset.freq, freqBtn);
      }
      
      // 标签页切换
      const tabBtn = e.target.closest('.tab');
      if (tabBtn) {
        this.switchTab(tabBtn.dataset.tab, tabBtn);
      }
      
      // 日历月份切换
      const calArrow = e.target.closest('.cal-arrow');
      if (calArrow) {
        this.changeMonth(parseInt(calArrow.dataset.dir));
      }
      
      // 星期选择
      const wdBtn = e.target.closest('.wd-btn');
      if (wdBtn) {
        this.toggleWeekday(wdBtn);
      }
    });
  }

  // ========== 事件处理 ==========
  handleCompletion(id, type) {
    const habit = this.store.getById(id);
    if (!habit) return;
    
    if (type === 'daily') {
      this.store.toggleDailyCompletion(id, this.manager.todayISO);
      this.showToast(habit.completions[this.manager.todayISO] ? `✓ ${habit.name}` : `取消：${habit.name}`);
    } else if (type === 'weekly') {
      const weekKey = this.manager.getWeekKey();
      this.store.toggleWeeklyCompletion(id, weekKey);
      const status = this.manager.getWeeklyStatus(habit);
      this.showToast(status.done ? `✓ 本周完成：${habit.name}` : `取消：${habit.name}`);
    } else if (type === 'interval') {
      this.store.toggleIntervalCompletion(id, this.manager.todayISO);
      const status = this.manager.getIntervalStatus(habit);
      this.showToast(status.due ? `✓ 完成：${habit.name}` : `取消：${habit.name}`);
    }
  }

  handleYearlyCompletion(id) {
    const habit = this.store.getById(id);
    if (!habit) return;
    
    const year = this.manager.today.getFullYear();
    this.store.toggleYearlyCompletion(id, year);
    const status = this.manager.getYearlyStatus(habit);
    this.showToast(status.done ? `✓ 年度目标完成：${habit.name} 🎊` : `取消：${habit.name}`);
  }

  // ========== 渲染 ==========
  render() {
    this.renderDateBar();
    this.renderAllLists();
    this.renderCalendar();
    this.renderStats();
    this.renderUpcoming();
  }

  renderDateBar() {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const dateMain = document.getElementById('date-main');
    const overallText = document.getElementById('overall-text');
    
    if (dateMain) {
      dateMain.textContent = `${this.manager.today.getMonth() + 1}月${this.manager.today.getDate()}日，星期${days[this.manager.today.getDay()]}`;
    }
    
    if (overallText) {
      const stats = this.manager.getTodayStats();
      overallText.textContent = `今日 ${stats.pct}%`;
    }
  }

  renderAllLists() {
    this.renderDailyList();
    this.renderWeeklyList();
    this.renderIntervalList();
    this.renderYearlyList();
  }

  renderDailyList() {
    const el = document.getElementById('list-daily');
    if (!el) return;
    
    const items = this.store.getByFreq('daily');
    
    if (!items.length) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon">· · ·</div><div class="empty-text">还没有每日习惯</div></div>`;
      return;
    }
    
    el.innerHTML = items.map(h => {
      const status = this.manager.getDailyStatus(h);
      const weekDots = this.manager.getDailyWeekDots(h, 7);
      
      return `<div class="habit-card ${status.done ? 'completed' : ''}" data-id="${h.id}" data-type="daily">
        <div class="check-btn ${status.done ? 'done' : ''}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 7"/></svg>
        </div>
        <div class="habit-info">
          <div class="habit-name">${Security.sanitizeHtml(h.name)}</div>
          <div class="habit-meta">${h.time ? '⏰ ' + h.time : '每日打卡'}</div>
          <div class="week-dots">
            ${weekDots.map(d => `<div class="wdot ${d.cls}"></div>`).join('')}
          </div>
        </div>
        <div style="text-align:right;">
          <div class="habit-streak">${status.streak > 0 ? status.streak + ' Day Streak' : '–'}</div>
          <div style="font-size:10px;color:var(--text-3);margin-top:2px;letter-spacing:0.05em;">STREAK</div>
        </div>
      </div>`;
    }).join('');
  }

  renderWeeklyList() {
    const el = document.getElementById('list-weekly');
    if (!el) return;
    
    const items = this.store.getByFreq('weekly');
    const dn = ['日', '一', '二', '三', '四', '五', '六'];
    
    if (!items.length) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon">· · ·</div><div class="empty-text">还没有每周习惯</div></div>`;
      return;
    }
    
    el.innerHTML = items.map(h => {
      const status = this.manager.getWeeklyStatus(h);
      const target = (h.days || []).map(d => '周' + dn[d]).join(' / ');
      const bars = this.manager.getWeeklyProgress(h);
      
      return `<div class="habit-card ${status.done ? 'completed' : ''}" data-id="${h.id}" data-type="weekly">
        <div class="check-btn ${status.done ? 'done' : ''}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 7"/></svg>
        </div>
        <div class="habit-info">
          <div class="habit-name">${Security.sanitizeHtml(h.name)}</div>
          <div class="habit-meta">📅 ${target || '每周'}</div>
          <div style="display:flex;gap:4px;margin-top:9px;">
            ${bars.map(b => `<div style="flex:1;height:5px;border-radius:3px;background:${b.done ? 'var(--accent-mid)' : 'var(--border-solid)'}"></div>`).join('')}
          </div>
          <div style="font-size:10px;color:var(--text-3);margin-top:3px;letter-spacing:0.05em;">LAST 4 WEEKS</div>
        </div>
        <div class="habit-badge ${status.done ? 'badge-done' : 'badge-due'}">${status.label}</div>
      </div>`;
    }).join('');
  }

  renderIntervalList() {
    const el = document.getElementById('list-interval');
    if (!el) return;
    
    const items = this.store.getByFreq('interval');
    
    if (!items.length) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon">· · ·</div><div class="empty-text">还没有间隔习惯</div></div>`;
      return;
    }
    
    el.innerHTML = items.map(h => {
      const status = this.manager.getIntervalStatus(h);
      return `<div class="habit-card" data-id="${h.id}" data-type="interval">
        <div class="check-btn ${status.due ? 'done' : ''}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 7"/></svg>
        </div>
        <div class="habit-info">
          <div class="habit-name">${Security.sanitizeHtml(h.name)}</div>
          <div class="habit-meta">每${h.interval}${h.unit === 'week' ? '周' : '天'}一次${h.lastDone ? ' · 上次：' + h.lastDone : ''}</div>
          <div class="week-progress">
            <div class="week-progress-fill" style="width:${status.pct || 0}%;background:${status.due ? 'var(--done-bg)' : 'var(--accent-mid)'}"></div>
          </div>
        </div>
        <div class="habit-badge ${status.cls}">${status.label}</div>
      </div>`;
    }).join('');
  }

  renderYearlyList() {
    const el = document.getElementById('list-yearly');
    if (!el) return;
    
    const items = this.store.getByFreq('yearly');
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const curYear = this.manager.today.getFullYear();
    
    if (!items.length) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon">· · ·</div><div class="empty-text">还没有年度习惯</div></div>`;
      return;
    }
    
    el.innerHTML = items.map(h => {
      const status = this.manager.getYearlyStatus(h);
      return `<div class="yearly-card">
        <div class="yearly-header">
          <div class="habit-info">
            <div class="habit-name">${Security.sanitizeHtml(h.name)}</div>
            <div class="habit-meta">${h.targetMonth ? '目标：' + months[h.targetMonth - 1] : '全年'} · 已完成 ${(h.yearCompletions || []).length} 年</div>
          </div>
          <div class="habit-badge ${status.done ? 'badge-done' : 'badge-due'}">${status.label}</div>
        </div>
        <div class="yearly-months" data-hid="${h.id}">
          ${months.map((m, i) => {
            const isCur = (i + 1) === this.manager.today.getMonth() + 1;
            const isTarget = h.targetMonth && h.targetMonth === (i + 1);
            const cls = status.done && isTarget ? 'done' : isCur ? 'current' : '';
            return `<div class="month-dot ${cls}" data-hid="${h.id}" data-month="${i + 1}" title="${m}">${m.replace('月', '')}</div>`;
          }).join('')}
        </div>
      </div>`;
    }).join('');
  }

  renderCalendar() {
    const el = document.getElementById('cal-month-label');
    const grid = document.getElementById('cal-grid');
    if (!el || !grid) return;
    
    const d = new Date(this.manager.today.getFullYear(), this.manager.today.getMonth() + this.calOffset, 1);
    el.textContent = `${d.getFullYear()}年${d.getMonth() + 1}月`;
    
    const firstDay = (d.getDay() || 7) - 1;
    const dim = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    
    grid.innerHTML = ['一', '二', '三', '四', '五', '六', '日'].map(w => `<div class="cal-wd">${w}</div>`).join('');
    
    for (let i = 0; i < firstDay; i++) grid.innerHTML += `<div class="cal-day grey"></div>`;
    
    for (let day = 1; day <= dim; day++) {
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = ds === this.manager.todayISO;
      const isFuture = ds > this.manager.todayISO;
      
      const daily = this.store.getByFreq('daily');
      let pct = 0;
      if (daily.length && !isFuture) {
        const c = daily.filter(h => h.completions && h.completions[ds]).length;
        pct = c / daily.length;
      }
      
      let cls = '';
      if (isFuture) cls = 'future';
      else if (pct === 1) cls = 'full';
      else if (pct > 0) cls = 'partial';
      
      grid.innerHTML += `<div class="cal-day ${cls} ${isToday ? 'today' : ''}">${day}</div>`;
    }
  }

  renderStats() {
    const streakSummary = this.manager.getStreakSummary();
    const todayStats = this.manager.getTodayStats();
    
    const sStreak = document.getElementById('s-streak');
    const sRate = document.getElementById('s-rate');
    const sTotal = document.getElementById('s-total');
    const sToday = document.getElementById('s-today');
    
    if (sStreak) sStreak.textContent = streakSummary.maxStreak;
    if (sRate) sRate.textContent = todayStats.pct + '%';
    if (sTotal) sTotal.textContent = this.store.getAll().length;
    if (sToday) sToday.textContent = todayStats.done;
  }

  renderUpcoming() {
    const el = document.getElementById('upcoming-list');
    if (!el) return;
    
    const upcoming = this.manager.getUpcomingDue();
    
    if (!upcoming.length) {
      el.innerHTML = `<div style="color:var(--text-3);font-size:12px;text-align:center;padding:10px;letter-spacing:0.04em;">全部都在掌控中 ✓</div>`;
      return;
    }
    
    el.innerHTML = upcoming.map(u => `<div class="upcoming-item">
      <div class="up-dot" style="background:${u.color}"></div>
      <div class="up-name">${Security.sanitizeHtml(u.name)}</div>
      <div class="up-when">${u.when}</div>
    </div>`).join('');
  }

  // ========== UI 操作 ==========
  setFreq(freq, btn) {
    this.currentFreq = freq;
    document.querySelectorAll('.freq-btn').forEach(b => b.classList.remove('active'));
    btn?.classList.add('active');
    document.getElementById('f-time-wrap')?.classList.toggle('hidden', freq !== 'daily');
    document.getElementById('f-days-wrap')?.classList.toggle('hidden', freq !== 'weekly');
    document.getElementById('f-interval-wrap')?.classList.toggle('hidden', freq !== 'interval');
    document.getElementById('f-month-wrap')?.classList.toggle('hidden', freq !== 'yearly');
  }

  switchTab(tab, btn) {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    (btn || document.querySelector(`.tab[data-tab="${tab}"]`))?.classList.add('active');
    document.getElementById('panel-' + tab)?.classList.add('active');
  }

  changeMonth(dir) {
    this.calOffset += dir;
    this.renderCalendar();
  }

  toggleWeekday(btn) {
    btn.classList.toggle('active');
    const d = parseInt(btn.dataset.d);
    if (this.selectedDays.includes(d)) {
      this.selectedDays = this.selectedDays.filter(x => x !== d);
    } else {
      this.selectedDays.push(d);
    }
  }

  addHabit() {
    const nameEl = document.getElementById('f-name');
    const name = nameEl?.value.trim();
    if (!name) {
      this.showToast('⚠ 请填写习惯名称');
      return;
    }
    
    const h = { name, freq: this.currentFreq };
    
    if (this.currentFreq === 'daily') {
      h.time = document.getElementById('f-time')?.value || '';
    } else if (this.currentFreq === 'weekly') {
      h.days = [...this.selectedDays];
    } else if (this.currentFreq === 'interval') {
      h.interval = parseInt(document.getElementById('f-interval')?.value) || 2;
      h.unit = document.getElementById('f-interval-unit')?.value || 'day';
      h.lastDone = document.getElementById('f-last-done')?.value || null;
    } else if (this.currentFreq === 'yearly') {
      const m = document.getElementById('f-month')?.value;
      h.targetMonth = m ? parseInt(m) : null;
    }
    
    this.store.add(h);
    
    // 清空表单
    if (nameEl) nameEl.value = '';
    document.querySelectorAll('.wd-btn').forEach(b => b.classList.remove('active'));
    this.selectedDays = [];
    this.switchTab(this.currentFreq);
    
    this.showToast('✓ 已添加：' + name);
  }

  showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = msg;
    toast.classList.add('show');
    
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }
}

export default HabitUI;
