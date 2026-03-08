// habit-tracker/modules/store.js - HabitStore 类
import { storage } from '../../_shared/storage.js';
import Utils from '../../_shared/utils.js';

const HABITS_KEY = 'soul-nav-habits';
const LEGACY_HABITS_KEY = 'soul-nav-habits'; // 兼容旧的 localStorage key

class HabitStore {
  constructor() {
    this.habits = [];
    this.listeners = [];
    this.loadFromStorage();
  }

  // ========== 事件监听 ==========
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => cb(this.habits));
  }

  // ========== 存储操作 ==========
  loadFromStorage() {
    const data = storage.get(LEGACY_HABITS_KEY, []);
    if (Array.isArray(data) && data.length > 0) {
      this.habits = data;
    } else {
      // 默认数据
      this.habits = this.getDefaultHabits();
    }
    return this.habits;
  }

  saveToStorage() {
    storage.set(HABITS_KEY, this.habits);
    this.notify();
  }

  getDefaultHabits() {
    const todayISO = Utils.todayISO();
    const getLastNDays = (n) => {
      const obj = {};
      for (let i = 0; i < n; i++) {
        obj[Utils.offsetDate(todayISO, -i)] = true;
      }
      return obj;
    };

    return [
      { id: Utils.uid('h'), name: '每天喝8杯水', freq: 'daily', time: '08:00', streak: 7, completions: getLastNDays(7) },
      { id: Utils.uid('h'), name: '22:00前睡觉', freq: 'daily', time: '22:00', streak: 3, completions: getLastNDays(3) },
      { id: Utils.uid('h'), name: '走10000步', freq: 'daily', time: '', streak: 12, completions: getLastNDays(12) },
      { id: Utils.uid('h'), name: '阅读30分钟', freq: 'daily', time: '', streak: 5, completions: getLastNDays(5) },
      { id: Utils.uid('h'), name: '洗床单', freq: 'weekly', days: [1], streak: 3, weekCompletions: {} },
      { id: Utils.uid('h'), name: '洗衣服', freq: 'weekly', days: [3], streak: 5, weekCompletions: {} },
      { id: Utils.uid('h'), name: '做面膜', freq: 'interval', interval: 2, unit: 'day', lastDone: Utils.offsetDate(todayISO, -1), streak: 8 },
      { id: Utils.uid('h'), name: '年度计划', freq: 'yearly', targetMonth: 1, streak: 2, yearCompletions: [2023] }
    ];
  }

  // ========== CRUD 操作 ==========
  getAll() {
    return [...this.habits];
  }

  getById(id) {
    return this.habits.find(h => h.id === id);
  }

  getByFreq(freq) {
    return this.habits.filter(h => h.freq === freq);
  }

  add(habit) {
    const newHabit = {
      id: Utils.uid('h'),
      ...habit,
      createdAt: new Date().toISOString()
    };
    
    // 初始化 completions
    if (newHabit.freq === 'daily') {
      newHabit.completions = {};
      newHabit.streak = 0;
    } else if (newHabit.freq === 'weekly') {
      newHabit.weekCompletions = {};
      newHabit.streak = 0;
    } else if (newHabit.freq === 'interval') {
      newHabit.lastDone = null;
      newHabit.streak = 0;
    } else if (newHabit.freq === 'yearly') {
      newHabit.yearCompletions = [];
      newHabit.streak = 0;
    }

    this.habits.push(newHabit);
    this.saveToStorage();
    return newHabit;
  }

  update(id, updates) {
    const index = this.habits.findIndex(h => h.id === id);
    if (index === -1) return null;
    
    this.habits[index] = { ...this.habits[index], ...updates };
    this.saveToStorage();
    return this.habits[index];
  }

  delete(id) {
    const index = this.habits.findIndex(h => h.id === id);
    if (index === -1) return false;
    
    this.habits.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // ========== 完成操作 ==========
  toggleDailyCompletion(habitId, dateISO) {
    const habit = this.getById(habitId);
    if (!habit || habit.freq !== 'daily') return false;
    
    if (!habit.completions) habit.completions = {};
    
    if (habit.completions[dateISO]) {
      delete habit.completions[dateISO];
    } else {
      habit.completions[dateISO] = true;
    }
    
    // 重新计算 streak
    habit.streak = this.calculateDailyStreak(habit);
    this.saveToStorage();
    return true;
  }

  calculateDailyStreak(habit) {
    if (!habit.completions) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const dateISO = Utils.offsetDate(today, -i);
      if (habit.completions[dateISO]) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  }

  toggleWeeklyCompletion(habitId, weekKey) {
    const habit = this.getById(habitId);
    if (!habit || habit.freq !== 'weekly') return false;
    
    if (!habit.weekCompletions) habit.weekCompletions = {};
    
    if (habit.weekCompletions[weekKey]) {
      delete habit.weekCompletions[weekKey];
    } else {
      habit.weekCompletions[weekKey] = true;
    }
    
    this.saveToStorage();
    return true;
  }

  toggleIntervalCompletion(habitId, dateISO) {
    const habit = this.getById(habitId);
    if (!habit || habit.freq !== 'interval') return false;
    
    if (habit.lastDone === dateISO) {
      habit.lastDone = Utils.offsetDate(dateISO, -1);
    } else {
      habit.lastDone = dateISO;
      habit.streak = (habit.streak || 0) + 1;
    }
    
    this.saveToStorage();
    return true;
  }

  toggleYearlyCompletion(habitId, year) {
    const habit = this.getById(habitId);
    if (!habit || habit.freq !== 'yearly') return false;
    
    if (!habit.yearCompletions) habit.yearCompletions = [];
    
    const index = habit.yearCompletions.indexOf(year);
    if (index >= 0) {
      habit.yearCompletions.splice(index, 1);
    } else {
      habit.yearCompletions.push(year);
    }
    
    this.saveToStorage();
    return true;
  }

  // ========== 导出/导入 ==========
  exportToJSON() {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      habits: this.habits
    };
  }

  importFromJSON(data) {
    if (!data || !Array.isArray(data.habits)) {
      throw new Error('Invalid data format');
    }
    
    this.habits = data.habits;
    this.saveToStorage();
    return this.habits;
  }
}

export default HabitStore;
