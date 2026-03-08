# Soul Nav Apps 优化计划

## 概述

本计划基于 `research.md` 的研究结果，为 `apps/` 目录下的应用（habit-tracker、llmchat）制定详细的优化方案。

---

## 一、现状分析

### 1.1 应用清单

| 应用 | 文件 | 状态 | 主要问题 |
|------|------|------|----------|
| habit-tracker | `habit-tracker.html` + `habit-tracker.js` | 功能完整 | 日期时区问题、localStorage 限制、无数据同步 |
| llmchat | `llmchat.html` | 原型阶段 | 无持久化、仅模拟响应、XSS 风险、API Key 明文存储 |

### 1.2 共性问题

1. **安全风险**: XSS 漏洞（`innerHTML` 直接使用）、API Key 明文存储
2. **性能问题**: 无 IndexedDB 使用、大量数据时 localStorage 性能瓶颈
3. **可访问性**: 缺少 ARIA 属性、键盘导航不完善
4. **代码组织**: CSS/JS 内联、重复代码、无模块化

---

## 二、优化方案

### 2.1 架构优化

#### 目标结构

```
apps/
├── _lib/                      # 工具库（纯函数，无状态，无业务逻辑）
│   ├── storage.js             # IndexedDB/localStorage 封装
│   ├── security.js            # XSS 防护、输入净化
│   ├── validate.js            # 输入验证工具
│   └── utils.js               # 通用工具函数（日期、格式化等）
├── _templates/                # 新APP模板
│   └── new-app/
│       ├── index.html
│       ├── app.js
│       └── styles.css
├── habit-tracker/             # 完全独立，只依赖 _lib
│   ├── index.html
│   ├── app.js
│   ├── store.js               # 业务存储（使用 _lib/storage.js）
│   └── styles.css
└── llmchat/
    ├── index.html
    ├── app.js
    ├── store.js
    ├── api.js
    └── styles.css
```

#### 技术决策

| 方面 | 方案 | 权衡 |
|------|------|------|
| 存储 | IndexedDB (Dexie.js) | 支持大数据、结构化查询，但增加依赖 |
| 状态管理 | 自定义事件 + 观察者模式 | 轻量，但无 DevTools 支持 |
| 样式 | CSS 变量 + BEM 命名 | 可维护，需要约定 |
| 安全 | DOMPurify + CSP | 额外依赖，但必要 |
| **架构** | **`_lib` 工具库 + 独立 APP** | **工具复用 + 完全隔离** |

### 2.2 habit-tracker 优化详情

#### 功能增强

1. **日期处理优化**
   - 使用 `date-fns` 或原生 `Intl.DateTimeFormat`
   - 统一使用 UTC 存储，本地时区显示
   - 修复跨天边界问题

2. **数据存储升级**
   - 迁移到 IndexedDB
   - 添加数据版本管理
   - 实现数据导出/导入 (JSON)

3. **UI 改进**
   - 习惯分组/标签
   - 统计图表 (完成率趋势)
   - 拖拽排序

#### 代码重构

```javascript
// 新的类结构
class HabitStore {
  constructor() {
    this.db = new Dexie('HabitTracker');
    this.db.version(1).stores({
      habits: '++id, name, createdAt',
      completions: '++id, habitId, date'
    });
  }
}

class HabitApp {
  constructor() {
    this.store = new HabitStore();
    this.ui = new HabitUI(this.store);
    this.init();
  }
}
```

### 2.3 llmchat 优化详情

#### 功能增强

1. **API 集成**
   - 支持 OpenAI、Anthropic、本地模型 (Ollama)
   - 流式响应 (SSE)
   - API Key 安全存储 (加密或 browser.storage)

2. **持久化**
   - 对话历史存储 (IndexedDB)
   - 设置同步
   - 多会话管理

3. **UI/UX**
   - Markdown 渲染
   - 代码高亮
   - 消息编辑/删除
   - 多模型对比

#### 安全加固

```javascript
// XSS 防护
import DOMPurify from 'dompurify';

function renderMessage(content) {
  // 1. 净化 HTML
  const clean = DOMPurify.sanitize(content);
  // 2. 渲染 Markdown
  const html = marked.parse(clean);
  return html;
}

// API Key 存储 (使用 extension storage 而非 localStorage)
async function storeApiKey(key) {
  await chrome.storage.local.set({ 'llm_api_key': encrypt(key) });
}
```

---

## 三、任务列表

### Phase 1: 基础设施 (Priority: High)

- [ ] **Task 1.1**: 创建 `_shared/` 目录结构
  - 创建 `storage.js` - IndexedDB 封装
  - 创建 `security.js` - XSS 防护、输入验证
  - 创建 `utils.js` - 通用工具函数
  - 创建 `styles.css` - 基础样式 + CSS 变量

- [ ] **Task 1.2**: 添加依赖管理
  - 创建 `apps/package.json`
  - 添加 Dexie.js (IndexedDB)
  - 添加 DOMPurify (XSS 防护)
  - 添加 marked (Markdown 渲染，llmchat 用)

### Phase 2: habit-tracker 重构 (Priority: High)

- [ ] **Task 2.1**: 数据层重构
  - 创建 `HabitStore` 类 (使用 `_shared/storage.js`)
  - 实现数据迁移 (从 localStorage 到 IndexedDB)
  - 添加数据版本管理

- [ ] **Task 2.2**: 业务逻辑层
  - 创建 `HabitManager` 类
  - 实现习惯 CRUD
  - 实现完成追踪 (修复时区问题)
  - 实现统计计算

- [ ] **Task 2.3**: UI 层重构
  - 重构 `HabitUI` 类
  - 实现组件化 (日历、习惯卡片、统计面板)
  - 添加拖拽排序
  - 修复 XSS 漏洞 (使用 `_shared/security.js`)

- [ ] **Task 2.4**: 文件重组
  - 创建 `apps/habit-tracker/index.html`
  - 创建 `apps/habit-tracker/app.js`
  - 创建 `apps/habit-tracker/styles.css`
  - 更新引用 `_shared/*`

### Phase 3: llmchat 重构 (Priority: Medium)

- [ ] **Task 3.1**: 架构拆分
  - 将单文件拆分为多文件结构
  - 创建 `ChatStore` (对话持久化)
  - 创建 `ApiClient` (API 调用封装)

- [ ] **Task 3.2**: 安全加固
  - 集成 DOMPurify 防止 XSS
  - 实现 API Key 加密存储
  - 添加 CSP 配置

- [ ] **Task 3.3**: 功能完善
  - 实现真实 API 调用 (OpenAI/Anthropic)
  - 实现流式响应 (SSE)
  - 实现 Markdown 渲染 + 代码高亮
  - 实现多会话管理

- [ ] **Task 3.4**: UI 优化
  - 重构为组件化架构
  - 添加键盘快捷键
  - 改进可访问性 (ARIA)

### Phase 4: 测试与文档 (Priority: Medium)

- [ ] **Task 4.1**: 单元测试
  - 为 `_shared/*` 工具函数编写测试
  - 为 `HabitStore` 编写测试
  - 为 `ApiClient` 编写测试

- [ ] **Task 4.2**: E2E 测试
  - 使用 Playwright 测试 habit-tracker 核心流程
  - 测试 llmchat 对话流程

- [ ] **Task 4.3**: 文档
  - 更新 `apps/README.md`
  - 编写 API 文档
  - 编写迁移指南 (localStorage → IndexedDB)

### Phase 5: 集成与发布 (Priority: Low)

- [ ] **Task 5.1**: 构建流程
  - 配置 Vite/Rollup 打包
  - 配置代码分割
  - 配置资源压缩

- [ ] **Task 5.2**: 扩展集成
  - 更新 `manifest.json` 添加 apps 入口
  - 配置新标签页快速跳转

- [ ] **Task 5.3**: 发布
  - 版本号更新
  - 打包发布

---

## 四、文件结构

### 优化前

```
apps/
├── habit-tracker.html
├── habit-tracker.js
└── llmchat.html
```

### 优化后

```
apps/
├── _shared/
│   ├── package.json
│   ├── styles.css           # CSS 变量 + 基础样式
│   ├── storage.js           # IndexedDB 封装
│   ├── security.js          # XSS 防护
│   └── utils.js             # 通用工具
├── habit-tracker/
│   ├── index.html
│   ├── app.js               # 应用入口
│   ├── styles.css           # 组件样式
│   └── modules/
│       ├── store.js         # HabitStore
│       ├── manager.js       # HabitManager
│       └── ui.js            # HabitUI
└── llmchat/
    ├── index.html
    ├── app.js
    ├── styles.css
    └── modules/
        ├── store.js         # ChatStore
        ├── api.js           # ApiClient
        ├── ui.js            # ChatUI
        └── security.js      # 安全相关
```

---

## 五、权衡与决策

### 5.1 存储方案

| 方案 | 优点 | 缺点 | 决策 |
|------|------|------|------|
| localStorage | 简单、同步 API | 5MB 限制、阻塞主线程 | 仅用于简单配置 |
| IndexedDB | 大数据、异步、结构化 | API 复杂、需要封装 | **主要方案** |
| chrome.storage | 跨设备同步、加密 | 仅在扩展环境可用 | 可选方案 |

### 5.2 状态管理

| 方案 | 优点 | 缺点 | 决策 |
|------|------|------|------|
| 自定义事件 | 轻量、无依赖 | 调试困难、无 DevTools | **选择** |
| Redux | 生态完善、可预测 | 太重、样板代码多 | 不适用 |
| Zustand | 轻量、现代 | 额外依赖 | 备选 |

### 5.3 是否引入构建工具

| 方案 | 优点 | 缺点 | 决策 |
|------|------|------|------|
| 原生 ES Modules | 简单、无构建步骤 | 无 Tree Shaking、兼容性 | 开发阶段 |
| Vite | 快速 HMR、现代 | 需要构建步骤 | **生产阶段** |
| Rollup | 输出干净、配置灵活 | 配置复杂 | 备选 |

### 5.4 单文件 vs 多文件

| 维度 | 单文件 (现状) | 多文件 (目标) |
|------|---------------|---------------|
| 部署 | 简单，单个文件 | 需要构建/合并 |
| 维护 | 困难，代码耦合 | 清晰，模块分离 |
| 缓存 | 整体缓存，更新代价大 | 细粒度缓存 |
| 协作 | 冲突多 | 冲突少 |
| **决策** | 现状 | **目标** |

---

## 六、时间线估算

| Phase | 任务数 | 预估时间 | 里程碑 |
|-------|--------|----------|--------|
| Phase 1 | 2 | 2 天 | 基础设施完成 |
| Phase 2 | 4 | 5 天 | habit-tracker v2 完成 |
| Phase 3 | 4 | 7 天 | llmchat v2 完成 |
| Phase 4 | 3 | 3 天 | 测试文档完成 |
| Phase 5 | 3 | 2 天 | 发布完成 |
| **总计** | 19 | **19 天** | - |

---

## 七、风险评估

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|----------|
| 数据迁移失败 | 中 | 高 | 完整备份、灰度迁移、回滚方案 |
| IndexedDB 浏览器兼容性 | 低 | 中 | 使用 Dexie.js 封装、降级到 localStorage |
| 重构引入新 Bug | 高 | 中 | 完整测试、分阶段发布 |
| 开发时间超期 | 中 | 低 | 优先级排序、MVP 先行 |

---

*计划创建时间: 2026-03-04*
*基于研究: research.md*
