// habit-tracker/app.js - 应用入口
import HabitStore from './modules/store.js';
import HabitManager from './modules/manager.js';
import HabitUI from './modules/ui.js';

class HabitTrackerApp {
  constructor() {
    this.store = new HabitStore();
    this.manager = new HabitManager(this.store);
    this.ui = new HabitUI(this.store, this.manager);
    this.init();
  }

  async init() {
    console.log('[HabitTracker] Initializing...');
    this.ui.init();
    console.log('[HabitTracker] Ready');
  }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
  window.app = new HabitTrackerApp();
});
