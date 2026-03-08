# Soul Nav Apps

## 概述

`soul-nav` 扩展的内置应用集合。

## 目录结构

```
apps/
├── _shared/                # 共享库
│   ├── storage.js          # 统一存储封装
│   ├── security.js         # 安全工具
│   ├── utils.js            # 通用工具
│   └── styles.css          # 共享样式
├── _templates/new-app/     # 新应用模板
├── habit-tracker/          # 习惯追踪
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── modules/
│       ├── store.js
│       ├── manager.js
│       └── ui.js
├── llmchat/                # LLM 聊天
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── modules/
│       ├── store.js
│       └── api.js
├── habit-tracker.html      # 原版（兼容用）
├── habit-tracker.js
├── llmchat.html            # 原版（兼容用）
└── package.json
```

## 共享库 (_shared/)

### storage.js

统一的存储封装，支持 localStorage 和 IndexedDB 双模式。

```javascript
import { storage } from '../_shared/storage.js';

// 基础存储
storage.set('key', { value: 123 });
const value = storage.get('key', defaultValue);

// IndexedDB（可选）
await storage.init();
await storage.idbSet('key', { value: 123 });
```

### security.js

安全工具，包括 XSS 防护、输入验证、数据混淆等。

```javascript
import Security from '../_shared/security.js';

// XSS 防护
const clean = Security.sanitizeHtml(userInput);

// 安全存储 API Key
await Security.secureStore('api_key', key, true);
```

### utils.js

通用工具函数。

```javascript
import Utils from '../_shared/utils.js';

// 日期工具
Utils.todayISO();
Utils.offsetDate(date, days);
Utils.daysBetween(a, b);

// 格式化
Utils.formatDate(date);
Utils.formatTime(date);
Utils.truncate(str, 50);

// DOM 工具
Utils.createElement(tag, attrs, children);

// 其他
Utils.uid('prefix');
Utils.deepClone(obj);
Utils.debounce(fn, 300);
```

## 开发新应用

使用 `_templates/new-app/` 作为起点：

```bash
cp -r apps/_templates/new-app apps/my-new-app
```

## 进度

- ✅ Phase 1: 基础设施
- ✅ Phase 2: habit-tracker 重构
- ✅ Phase 3: llmchat 重构 (核心模块完成)
- ⏳ Phase 4: 测试与文档 (可选)
- ⏳ Phase 5: 集成与发布 (可选)

## MVP 已可用

- habit-tracker: 完整重构，模块化架构
- llmchat: 核心模块完成（store, api, ui）
- _shared: 共享库完整可用
