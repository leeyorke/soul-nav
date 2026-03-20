let habits = JSON.parse(localStorage.getItem('soul-nav-habits') || '[]');
let calOffset = 0, currentFreq = 'daily', selectedDays = [];
const today = new Date(), todayStr = fmtDate(today);

if (habits.length === 0) {
    habits = [
        { id: uid(), name: '每天喝8杯水', freq: 'daily', time: '08:00', streak: 7, completions: getLastNDays(7) },
        { id: uid(), name: '22:00前睡觉', freq: 'daily', time: '22:00', streak: 3, completions: getLastNDays(3) },
        { id: uid(), name: '走10000步', freq: 'daily', time: '', streak: 12, completions: getLastNDays(12) },
        { id: uid(), name: '阅读30分钟', freq: 'daily', time: '', streak: 5, completions: getLastNDays(5) },
        { id: uid(), name: '每天吃一个西红柿', freq: 'daily', time: '', streak: 2, completions: getLastNDays(2) },
        { id: uid(), name: '洗床单', freq: 'weekly', days: [1], streak: 3, weekCompletions: {} },
        { id: uid(), name: '洗衣服', freq: 'weekly', days: [3], streak: 5, weekCompletions: {} },
        { id: uid(), name: '彻底打扫卫生', freq: 'weekly', days: [6], streak: 2, weekCompletions: {} },
        { id: uid(), name: '做面膜', freq: 'interval', interval: 2, unit: 'day', lastDone: offsetDate(-1), streak: 8 },
        { id: uid(), name: '换内衣', freq: 'interval', interval: 2, unit: 'day', lastDone: offsetDate(-2), streak: 15 },
        { id: uid(), name: '洗澡', freq: 'interval', interval: 2, unit: 'day', lastDone: offsetDate(-1), streak: 20 },
        { id: uid(), name: '年度计划', freq: 'yearly', targetMonth: 1, streak: 2, yearCompletions: [2023] },
        { id: uid(), name: '年度总结', freq: 'yearly', targetMonth: 12, streak: 2, yearCompletions: [2023] },
    ]; save();
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function fmtDate(d) { return d.toISOString().slice(0, 10); }
function offsetDate(n) { const d = new Date(today); d.setDate(d.getDate() + n); return fmtDate(d); }
function getLastNDays(n) { const a = {}; for (let i = 0; i < n; i++) a[offsetDate(-i)] = true; return a; }
function save() { localStorage.setItem('soul-nav-habits', JSON.stringify(habits)); }
function getWeekKey(d) { const dt = d || new Date(); const day = dt.getDay() || 7; const m = new Date(dt); m.setDate(dt.getDate() - day + 1); return fmtDate(m); }
function getDaysBetween(a, b) { return Math.round((new Date(b) - new Date(a)) / 86400000); }
function calcStreak(c) { if (!c) return 0; let s = 0, d = new Date(today); while (c[fmtDate(d)]) { s++; d.setDate(d.getDate() - 1); } return s; }

function getIntervalStatus(h) {
    if (!h.lastDone) return { label: '今天做吧', cls: 'badge-due', due: true };
    const days = h.unit === 'week' ? h.interval * 7 : h.interval;
    const diff = getDaysBetween(h.lastDone, todayStr);
    if (diff >= days) return { label: '今天该做了', cls: 'badge-due', due: true };
    const rem = days - diff;
    return { label: rem === 1 ? '明天做' : `还有 ${rem} 天`, cls: 'badge-later', due: false };
}
function getWeeklyStatus(h) {
    const wk = getWeekKey(), done = h.weekCompletions && h.weekCompletions[wk];
    return done ? { label: '本周完成', cls: 'badge-done', done: true } : { label: '本周待做', cls: 'badge-due', done: false };
}

function render() { renderDateBar(); renderAllLists(); renderCalendar(); renderStats(); renderUpcoming(); }

function renderDateBar() {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    document.getElementById('date-main').textContent = `${today.getMonth() + 1}月${today.getDate()}日，星期${days[today.getDay()]}`;
    const daily = habits.filter(h => h.freq === 'daily');
    const done = daily.filter(h => h.completions && h.completions[todayStr]).length;
    document.getElementById('overall-text').textContent = `今日 ${daily.length ? Math.round(done / daily.length * 100) : 0}%`;
}
function renderAllLists() { renderDailyList(); renderWeeklyList(); renderIntervalList(); renderYearlyList(); }

function renderDailyList() {
    const el = document.getElementById('list-daily');
    const items = habits.filter(h => h.freq === 'daily');
    if (!items.length) { el.innerHTML = `<div class="empty-state"><div class="empty-icon">· · ·</div><div class="empty-text">还没有每日习惯</div></div>`; return; }
    el.innerHTML = items.map(h => {
        const done = h.completions && h.completions[todayStr];
        const streak = calcStreak(h.completions);
        const dots = [6, 5, 4, 3, 2, 1, 0].map(i => {
            const ds = offsetDate(-i), f = h.completions && h.completions[ds];
            const cls = i === 0 ? (done ? 'filled today' : 'today') : (f ? 'filled' : '');
            return `<div class="wdot ${cls}"></div>`;
        }).join('');
        return `<div class="habit-card ${done ? 'completed' : ''}" data-id="${h.id}" data-type="daily">
            <div class="check-btn ${done ? 'done' : ''}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 7"/></svg>
            </div>
            <div class="habit-info">
                <div class="habit-name">${h.name}</div>
                <div class="habit-meta">${h.time ? '⏰ ' + h.time : '每日打卡'}</div>
                <div class="week-dots">${dots}</div>
            </div>
            <div style="text-align:right;">
                <div class="habit-streak">${streak > 0 ? streak + ' Day Streak' : '–'}</div>
                <div style="font-size:10px;color:var(--text-3);margin-top:2px;letter-spacing:0.05em;">STREAK</div>
            </div>
            <button class="delete-btn" data-delete="${h.id}" title="删除习惯">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
        </div>`;
    }).join('');
}

function renderWeeklyList() {
    const el = document.getElementById('list-weekly');
    const items = habits.filter(h => h.freq === 'weekly');
    if (!items.length) { el.innerHTML = `<div class="empty-state"><div class="empty-icon">· · ·</div><div class="empty-text">还没有每周习惯</div></div>`; return; }
    const dn = ['日', '一', '二', '三', '四', '五', '六'];
    el.innerHTML = items.map(h => {
        const { label, cls, done } = getWeeklyStatus(h);
        const target = (h.days || []).map(d => '周' + dn[d]).join(' / ');
        const bars = [3, 2, 1, 0].map(w => {
            const wk = getWeekKey(new Date(today.getTime() - w * 7 * 86400000));
            const f = h.weekCompletions && h.weekCompletions[wk];
            return `<div style="flex:1;height:5px;border-radius:3px;background:${f ? 'var(--accent-mid)' : 'var(--border-solid)'}"></div>`;
        }).join('');
        return `<div class="habit-card ${done ? 'completed' : ''}" data-id="${h.id}" data-type="weekly">
            <div class="check-btn ${done ? 'done' : ''}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 7"/></svg>
            </div>
            <div class="habit-info">
                <div class="habit-name">${h.name}</div>
                <div class="habit-meta">📅 ${target || '每周'}</div>
                <div style="display:flex;gap:4px;margin-top:9px;">${bars}</div>
                <div style="font-size:10px;color:var(--text-3);margin-top:3px;letter-spacing:0.05em;">LAST 4 WEEKS</div>
            </div>
            <div class="habit-badge ${cls}">${label}</div>
            <button class="delete-btn" data-delete="${h.id}" title="删除习惯">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
        </div>`;
    }).join('');
}

function renderIntervalList() {
    const el = document.getElementById('list-interval');
    const items = habits.filter(h => h.freq === 'interval');
    if (!items.length) { el.innerHTML = `<div class="empty-state"><div class="empty-icon">· · ·</div><div class="empty-text">还没有间隔习惯</div></div>`; return; }
    el.innerHTML = items.map(h => {
        const { label, cls, due } = getIntervalStatus(h);
        const intervalDays = h.unit === 'week' ? h.interval * 7 : h.interval;
        const diff = h.lastDone ? getDaysBetween(h.lastDone, todayStr) : intervalDays;
        const pct = Math.min(diff / intervalDays * 100, 100);
        return `<div class="habit-card" data-id="${h.id}" data-type="interval">
            <div class="check-btn ${due ? 'done' : ''}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 7"/></svg>
            </div>
            <div class="habit-info">
                <div class="habit-name">${h.name}</div>
                <div class="habit-meta">每${h.interval}${h.unit === 'week' ? '周' : '天'}一次${h.lastDone ? ' · 上次：' + h.lastDone : ''}</div>
                <div class="week-progress"><div class="week-progress-fill" style="width:${pct}%;background:${due ? 'var(--done-bg)' : 'var(--accent-mid)'}"></div></div>
            </div>
            <div class="habit-badge ${cls}">${label}</div>
            <button class="delete-btn" data-delete="${h.id}" title="删除习惯">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
        </div>`;
    }).join('');
}

function renderYearlyList() {
    const el = document.getElementById('list-yearly');
    const items = habits.filter(h => h.freq === 'yearly');
    if (!items.length) { el.innerHTML = `<div class="empty-state"><div class="empty-icon">· · ·</div><div class="empty-text">还没有年度习惯</div></div>`; return; }
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const curYear = today.getFullYear();
    el.innerHTML = items.map(h => {
        const done = h.yearCompletions && h.yearCompletions.includes(curYear);
        const dots = months.map((m, i) => {
            const isCur = (i + 1) === today.getMonth() + 1;
            const isTarget = h.targetMonth && h.targetMonth === (i + 1);
            const cls = done && isTarget ? 'done' : isCur ? 'current' : '';
            return `<div class="month-dot ${cls} ${h.id}" data-hid="${h.id}" data-month="${i + 1}" title="${m}">${m.replace('月', '')}</div>`;
        }).join('');
        return `<div class="yearly-card">
            <div class="yearly-header">
                <div class="habit-info">
                    <div class="habit-name">${h.name}</div>
                    <div class="habit-meta">${h.targetMonth ? '目标：' + months[h.targetMonth - 1] : '全年'} · 已完成 ${(h.yearCompletions || []).length} 年</div>
                </div>
                <div class="habit-badge ${done ? 'badge-done' : 'badge-due'}">${done ? '已完成' : '待完成'}</div>
                <button class="delete-btn" data-delete="${h.id}" title="删除习惯">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
            </div>
            <div class="yearly-months" data-hid="${h.id}">${dots}</div>
        </div>`;
    }).join('');
}

function toggleDaily(id) {
    const h = habits.find(x => x.id === id); if (!h) return; if (!h.completions) h.completions = {};
    if (h.completions[todayStr]) { delete h.completions[todayStr]; showToast('取消：' + h.name); } else { h.completions[todayStr] = true; showToast('✓ ' + h.name); }
    h.streak = calcStreak(h.completions); save(); render();
}
function toggleWeekly(id) {
    const h = habits.find(x => x.id === id); if (!h) return; if (!h.weekCompletions) h.weekCompletions = {};
    const wk = getWeekKey(); if (h.weekCompletions[wk]) { delete h.weekCompletions[wk]; showToast('取消：' + h.name); } else { h.weekCompletions[wk] = true; showToast('✓ 本周完成：' + h.name); }
    save(); render();
}
function toggleInterval(id) {
    const h = habits.find(x => x.id === id); if (!h) return;
    if (h.lastDone === todayStr) { h.lastDone = offsetDate(-1); showToast('取消：' + h.name); } else { h.lastDone = todayStr; h.streak = (h.streak || 0) + 1; showToast('✓ 完成：' + h.name); }
    save(); render();
}
function toggleYearly(id) {
    const h = habits.find(x => x.id === id); if (!h) return; const yr = today.getFullYear();
    if (!h.yearCompletions) h.yearCompletions = []; const i = h.yearCompletions.indexOf(yr);
    if (i >= 0) { h.yearCompletions.splice(i, 1); showToast('取消：' + h.name); } else { h.yearCompletions.push(yr); showToast('✓ 年度目标完成：' + h.name + ' 🎊'); }
    save(); render();
}

function deleteHabit(id) {
    const h = habits.find(x => x.id === id);
    if (!h) return;
    if (confirm(`确定要删除习惯「${h.name}」吗？此操作不可撤销。`)) {
        habits = habits.filter(x => x.id !== id);
        save();
        showToast('已删除：' + h.name);
        render();
    }
}

function setFreq(freq, btn) {
    currentFreq = freq;
    document.querySelectorAll('.freq-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active');
    document.getElementById('f-time-wrap').classList.toggle('hidden', freq !== 'daily');
    document.getElementById('f-days-wrap').classList.toggle('hidden', freq !== 'weekly');
    document.getElementById('f-interval-wrap').classList.toggle('hidden', freq !== 'interval');
    document.getElementById('f-month-wrap').classList.toggle('hidden', freq !== 'yearly');
}

function addHabit() {
    const name = document.getElementById('f-name').value.trim(); if (!name) { showToast('⚠ 请填写习惯名称'); return; }
    const h = { id: uid(), name, freq: currentFreq };
    if (currentFreq === 'daily') { h.time = document.getElementById('f-time').value; h.completions = {}; h.streak = 0; }
    else if (currentFreq === 'weekly') { h.days = [...selectedDays]; h.weekCompletions = {}; h.streak = 0; }
    else if (currentFreq === 'interval') { h.interval = parseInt(document.getElementById('f-interval').value) || 2; h.unit = document.getElementById('f-interval-unit').value; h.lastDone = document.getElementById('f-last-done').value || null; h.streak = 0; }
    else if (currentFreq === 'yearly') { const m = document.getElementById('f-month').value; h.targetMonth = m ? parseInt(m) : null; h.yearCompletions = []; h.streak = 0; }
    habits.push(h); save();
    document.getElementById('f-name').value = '';
    document.querySelectorAll('.wd-btn').forEach(b => b.classList.remove('active'));
    selectedDays = [];
    switchTab(currentFreq, document.querySelector(`.tab[data-tab="${currentFreq}"]`));
    showToast('✓ 已添加：' + name); render();
}

function quickAdd(name, freq, interval) {
    document.getElementById('f-name').value = name;
    setFreq(freq, document.querySelector(`.freq-btn[data-freq="${freq}"]`));
    if (interval) document.getElementById('f-interval').value = interval;
    document.getElementById('f-name').focus();
}

function switchTab(tab, btn) {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    (btn || document.querySelector(`.tab[data-tab="${tab}"]`))?.classList.add('active');
    document.getElementById('panel-' + tab)?.classList.add('active');
}

function renderCalendar() {
    const d = new Date(today.getFullYear(), today.getMonth() + calOffset, 1);
    document.getElementById('cal-month-label').textContent = `${d.getFullYear()}年${d.getMonth() + 1}月`;
    const grid = document.getElementById('cal-grid');
    grid.innerHTML = ['一', '二', '三', '四', '五', '六', '日'].map(w => `<div class="cal-wd">${w}</div>`).join('');
    const firstDay = (d.getDay() || 7) - 1;
    const dim = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) grid.innerHTML += `<div class="cal-day grey"></div>`;
    for (let day = 1; day <= dim; day++) {
        const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isT = ds === todayStr, isF = ds > todayStr;
        const dh = habits.filter(h => h.freq === 'daily');
        let pct = 0; if (dh.length && !isF) { const c = dh.filter(h => h.completions && h.completions[ds]).length; pct = c / dh.length; }
        const cls = isF ? 'future' : pct === 1 ? 'full' : pct > 0 ? 'partial' : '';
        grid.innerHTML += `<div class="cal-day ${cls} ${isT ? 'today' : ''}">${day}</div>`;
    }
}
function changeMonth(dir) { calOffset += dir; renderCalendar(); }

function renderStats() {
    let max = 0; habits.filter(h => h.freq === 'daily').forEach(h => { const s = calcStreak(h.completions); if (s > max) max = s; });
    document.getElementById('s-streak').textContent = max;
    const daily = habits.filter(h => h.freq === 'daily');
    const past = today.getDate(); let tot = daily.length * past, dn = 0;
    for (let i = 1; i <= past; i++) { const ds = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`; daily.forEach(h => { if (h.completions && h.completions[ds]) dn++; }); }
    document.getElementById('s-rate').textContent = (tot ? Math.round(dn / tot * 100) : 0) + '%';
    document.getElementById('s-total').textContent = habits.length;
    document.getElementById('s-today').textContent = habits.filter(h => h.freq === 'daily' && h.completions && h.completions[todayStr]).length;
}
function renderUpcoming() {
    const el = document.getElementById('upcoming-list'); const up = [];
    habits.filter(h => h.freq === 'interval').forEach(h => { const { due } = getIntervalStatus(h); if (due) up.push({ name: h.name, when: '今天该做了', color: 'var(--done-bg)' }); });
    habits.filter(h => h.freq === 'weekly').forEach(h => { const { done } = getWeeklyStatus(h); if (!done && h.days && h.days.includes(today.getDay())) up.push({ name: h.name, when: '今天（每周）', color: 'var(--accent)' }); });
    if (!up.length) { el.innerHTML = `<div style="color:var(--text-3);font-size:12px;text-align:center;padding:10px;letter-spacing:0.04em;">全部都在掌控中 ✓</div>`; return; }
    el.innerHTML = up.map(u => `<div class="upcoming-item"><div class="up-dot" style="background:${u.color}"></div><div class="up-name">${u.name}</div><div class="up-when">${u.when}</div></div>`).join('');
}

let toastTimer;
function showToast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200); }

// Event delegation setup
document.addEventListener('DOMContentLoaded', function() {
    // Frequency buttons
    document.getElementById('freq-grid').addEventListener('click', function(e) {
        const btn = e.target.closest('.freq-btn');
        if (!btn) return;
        setFreq(btn.dataset.freq, btn);
    });

    // Add habit button
    document.getElementById('btn-add').addEventListener('click', addHabit);

    // Quick add buttons
    document.getElementById('quick-add-btns').addEventListener('click', function(e) {
        const btn = e.target.closest('.quick-btn');
        if (!btn) return;
        quickAdd(btn.dataset.name, btn.dataset.freq, btn.dataset.interval);
    });

    // Tab bar
    document.getElementById('tab-bar').addEventListener('click', function(e) {
        const btn = e.target.closest('.tab');
        if (!btn) return;
        switchTab(btn.dataset.tab, btn);
    });

    // Calendar arrows
    document.getElementById('cal-arrows').addEventListener('click', function(e) {
        const btn = e.target.closest('.cal-arrow');
        if (!btn) return;
        changeMonth(parseInt(btn.dataset.dir));
    });

    // Weekday picker
    document.getElementById('f-days').addEventListener('click', function(e) {
        const btn = e.target.closest('.wd-btn');
        if (!btn) return;
        btn.classList.toggle('active');
        const d = parseInt(btn.dataset.d);
        if (selectedDays.includes(d)) selectedDays = selectedDays.filter(x => x !== d);
        else selectedDays.push(d);
    });

    // Habit list click delegation (for check buttons)
    document.addEventListener('click', function(e) {
        const checkBtn = e.target.closest('.check-btn');
        if (!checkBtn) return;
        const card = checkBtn.closest('.habit-card');
        if (!card) return;
        const id = card.dataset.id;
        const type = card.dataset.type;
        if (type === 'daily') toggleDaily(id);
        else if (type === 'weekly') toggleWeekly(id);
        else if (type === 'interval') toggleInterval(id);
    });

    // Yearly month dots
    document.addEventListener('click', function(e) {
        const dot = e.target.closest('.month-dot');
        if (!dot || !dot.dataset.hid) return;
        toggleYearly(dot.dataset.hid);
    });

    // Delete buttons
    document.addEventListener('click', function(e) {
        const deleteBtn = e.target.closest('.delete-btn');
        if (!deleteBtn) return;
        e.stopPropagation();
        const id = deleteBtn.dataset.delete;
        if (id) deleteHabit(id);
    });

    render();
});
