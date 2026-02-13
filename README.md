# Soul Nav - 极简浏览器导航

一个极简风格的 Edge 浏览器新标签页扩展，随机展示 SOUL 语录。

## 特性

- 🕐 大字体时钟显示
- 🔍 快速搜索（支持网址直接跳转）
- 💬 随机展示 SOUL 语录
- 🎨 深色极简设计
- ⌨️ 键盘快捷键支持

## 安装

### 开发者模式加载

1. 打开 Edge 浏览器，进入 `edge://extensions/`
2. 开启「开发人员模式」
3. 点击「加载解压缩的扩展」
4. 选择 `soul-nav` 文件夹

### 打包安装

```bash
npm run build
```

然后在 `dist/` 目录中找到打包好的扩展文件。

## 自定义语录

### 方式一：JSON 文件

创建 `soul.json` 文件：

```json
[
  "你的语录1",
  "你的语录2",
  "你的语录3"
]
```

### 方式二：Markdown 文件

创建 `soul.md` 文件：

```markdown
# Soul 语录

- 第一句语录
- 第二句语录
- "带引号的语录"

纯文本语录也可以
```

### 方式三：使用扩展存储

语录会自动保存到浏览器 localStorage，刷新页面后会保留。

## 键盘快捷键

| 按键 | 功能 |
|------|------|
| `Enter` | 搜索/跳转 |
| `Esc` | 清空搜索框 |
| `Space` | 切换语录（搜索框未聚焦时） |
| 点击语录 | 切换到下一条 |

## 技术栈

- 纯原生 JavaScript (ES6+)
- CSS3 (渐变、动画、毛玻璃效果)
- Chrome Extension Manifest V3

## 文件结构

```
soul-nav/
├── manifest.json      # 扩展配置
├── newtab.html        # 新标签页 HTML
├── newtab.js          # 主逻辑脚本
├── soul.js            # 语录管理模块
├── soul.json          # 默认语录数据
├── style.css          # 样式表
├── icons/             # 图标
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md          # 说明文档
```

## 许可证

MIT

---

🌟 在 Edge 商店上架后欢迎来评分！
