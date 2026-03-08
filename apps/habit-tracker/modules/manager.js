// habit-tracker/modules/manager.js - HabitManager 业务逻辑类
import Utils from '../../_shared/utils.js';

class HabitManager {
  constructor(store) {
    this.store = store;
    this.today = new Date();
    this.todayISO = Utils.toISODate(this.today);
  }

  // ========== 日期工具 ==========
  getWeekKey(date = this.today) {
    const dt = new Date(date);
    const day = dt.getDay() || 7; // 周日=7
    const monday = new Date(dt);
    monday.setDate(dt.getDate() - day + 1);
    return Utils.toISODate(monday);
  }

  getDaysBetween(a, b) {
    return Utils.daysBetween(a, b);
  }

  // ========== 状态计算 ==========
  getDailyStatus(habit) {
    if (!habit || habit.freq !== 'daily') return null;
    
    const completions = habit.completions || {};
    const done = completions[this.todayISO] || false;
    const streak = habit.streak || 0;
    
    return { done, streak };
  }

  getWeeklyStatus(habit) {
    if (!habit || habit.freq !== 'weekly') return null;
    
    const weekKey = this.getWeekKey();
    const weekCompletions = habit.weekCompletions || {};
    const done = weekCompletions[weekKey] || false;
    
    return {
      done,
      weekKey,
      label: done ? '本周完成' : '本周待做'
    };
  }

  getIntervalStatus(habit) {
    if (!habit || habit.freq !== 'interval') return null;
    
    const intervalDays = habit.unit === 'week' ? habit.interval * 7 : habit.interval;
    const lastDone = habit.lastDone;
    
    if (!lastDone) {
      return { due: true, label: '今天做吧', cls: 'badge-due', remDays: intervalDays };
    }
    
    const diff = this.getDaysBetween(lastDone, this.todayISO);
    
    if (diff >= intervalDays) {
      return { due: true, label: '今天该做了', cls: 'badge-due', remDays: 0 };
    }
    
    const rem = intervalDays - diff;
    return {
      due: false,
      label: rem === 1 ? '明天做' : `还有 ${rem} 天`,
      cls: 'badge-later',
      remDays: rem,
      pct: Math.min(diff / intervalDays * 100, 100)
    };
  }

  getYearlyStatus(habit) {
    if (!habit || habit.freq !== 'yearly') return null;
    
    const year = this.today.getFullYear();
    const yearCompletions = habit.yearCompletions || [];
    const done = yearCompletions.includes(year);
    
    return {
      done,
      year,
      count: yearCompletions.length,
      label: done ? '已完成' : '待完成'
    };
  }

  // ========== 统计 ==========
  getTodayStats() {
    const dailyHabits = this.store.getByFreq('daily');
    const total = dailyHabits.length;
    const done = dailyHabits.filter(h => {
      const status = this.getDailyStatus(h);
      return status && status.done;
    }).length;
    
    const pct = total > 0 ? Math.round(done / total * 100) : 0;
    
    return { total, done, pct };
  }

  getStreakSummary() {
    const habits = this.store.getAll();
    let maxStreak = 0;
    let totalStreak = 0;
    let count = 0;
    
    habits.forEach(h => {
      if (h.streak && h.streak > 0) {
        maxStreak = Math.max(maxStreak, h.streak);
        totalStreak += h.streak;
        count++;
      }
    });
    
    return { maxStreak, totalStreak, count };
  }

  getWeeklyProgress(habit) {
    if (!habit || habit.freq !== 'weekly') return [];
    
    const bars = [];
    for (let w = 0; w < 4; w++) {
      const weekDate = new Date(this.today);
      weekDate.setDate(weekDate.getDate() - w * 7);
      const wk = this.getWeekKey(weekDate);
      const weekCompletions = habit.weekCompletions || {};
      bars.push({ week: wk, done: weekCompletions[wk] || false });
    }
    
    return bars;
  }

  getDailyWeekDots(habit, days = 7) {
    if (!habit || habit.freq !== 'daily') return [];
    
    const dots = [];
    const completions = habit.completions || {};
    
    for (let i = days - 1; i >= 0; i--) {
      const dateISO = Utils.offsetDate(this.todayISO, -i);
      const isToday = i === 0;
      const done = completions[dateISO] || false;
      
      dots.push({
        date: dateISO,
        isToday,
        done,
        cls: isToday ? (done ? 'filled today' : 'today') : (done ? 'filled' : '')
      });
    }
    
    return dots;
  }

  getUpcomingDue() {
    const upcoming = [];
    const habits = this.store.getAll();
    
    // 间隔习惯
    habits.filter(h => h.freq === 'interval').forEach(h => {
      const status = this.getIntervalStatus(h);
      if (status && status.due) {
        upcoming.push({ name: h.name, when: '今天该做了', color: 'var(--done-bg)', type: 'interval' });
      }
    });
    
    // 每周习惯
    habits.filter(h => h.freq === 'weekly').forEach(h => {
      const status = this.getWeeklyStatus(h);
      if (status && !status.done) {
        // 检查今天是否是目标日期
        const todayDay = this.today.getDay();
        const targetDays = h.days || [];
        if (targetDays.includes(todayDay)) {
          upcoming.push({ name: h.name, when: '今天（每周）', color: 'var(--accent)', type: 'weekly' });
        }
      }
    });
    
    return upcoming;
  }
}

export default HabitManager;
