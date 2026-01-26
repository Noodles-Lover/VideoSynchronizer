# VideoSynchronizer 开发文档

这是一个基于 Vue 3 和 Vite 开发的网页工具，旨在让使用者能够同步观看两个视频（如动漫与反应视频）。本文件旨在介绍项目的结构、各文件的职责以及核心逻辑。

## 目录结构

```text
VideoSynchronizer/
├── .github/workflows/      # GitHub Actions 自动部署配置
├── public/                 # 静态资源
├── src/
│   ├── assets/             # SVG 图标资源
│   ├── components/         # Vue 组件
│   │   ├── SettingsPanel.vue # 全局设置面板
│   │   ├── VideoPane.vue     # 视频窗口容器
│   │   └── SideToolbar.vue   # 视频窗侧边快捷工具栏
│   ├── utils/              # 逻辑与工具函数
│   │   ├── store.js            # 全局状态管理 (Reactive Store)
│   │   ├── VideoPlayer.js      # 视频播放器 OOP 逻辑
│   │   ├── eventBus.js         # 全局事件总线
│   │   ├── useYouTube.js       # YouTube 解析与 Embed 构建工具
│   │   └── useWindowManagement.js # 窗口拖拽、缩放管理逻辑
│   ├── App.vue             # 根组件
│   └── main.js             # 入口文件
├── index.html
├── package.json
└── vite.config.js
```

### 核心文件说明

- **src/utils/VideoPlayer.js**
  - 视频播放器的抽象体系。
  - `VideoPlayer`: 抽象基类，定义了 `displayText`, `rawUrl`, `embedUrl`, `startTime` 等属性。
  - `YouTubeVideo`: 继承自 `VideoPlayer`，实现 YouTube 特有的加载（ID 提取、时间戳处理）和播放逻辑。
  - `LocalVideo`: 继承自 `VideoPlayer`，专门处理本地文件（Blob URL）的加载与播放。
  - `DirectLinkVideo`: 继承自 `VideoPlayer`，处理网络视频直链（如 .mp4）的加载与播放。
  - `createPlayer`: 工厂函数，根据输入自动识别类型并创建实例。

- **src/utils/store.js**
  - 使用 Vue 3 `reactive` 管理全局状态。
  - 存储 `viewer` (视听方) 和 `anime` (动漫方) 的 `VideoPlayer` 实例。
  - 存储 UI 配置：`forcedTop` (强制置顶), `fullScreen` (全屏状态), `settingsPosition` (面板位置), `settingsOpacity` (面板透明度), `viewerOpacity/animeOpacity` (视频窗独立透明度)。

- **src/components/SettingsPanel.vue**
  - 全局设置面板，负责视频 URL 输入、本地文件上传、同步播放控制等。
  - 通过 `eventBus` 发送 `sync-play` 信号。

- **src/components/VideoPane.vue**
  - 视频展示窗口，负责渲染 `iframe` (YouTube) 或 `video` (本地/直链) 标签。
  - 监听 `eventBus` 的 `sync-play` 事件执行播放。
  - **交互限制**：仅限顶部 `drag-handle` 区域触发窗口拖拽。
  - 集成了 `SideToolbar` 快捷工具。

- **src/components/SideToolbar.vue**
  - 视频窗右侧的快捷工具栏，具备 4 秒自动隐藏逻辑。
  - **功能**：独立置顶、全屏切换、不透明度滑块、快速设置弹窗（齿轮按钮）。
  - **视觉**：固定 0.85 不透明度，毛玻璃效果。

- **src/utils/eventBus.js**
  - 基于 Vue `reactive` 的简易事件总线，用于跨组件触发「同时播放」。

- **src/utils/useWindowManagement.js**: 封装多窗口的拖拽、缩放、置顶等布局逻辑。

### 数据流向

1. **视频加载**: `SettingsPanel` 或 `SideToolbar` -> `player.load()` -> 更新 `store` 实例。
2. **同步播放**: `SettingsPanel` -> `eventBus.emit('sync-play')` -> `VideoPane` 接收并调用 `player.play()`。
3. **窗口交互**: `App.vue` 全局监听鼠标 -> `useWindowManagement` 更新 `windows` 坐标 -> `VideoPane` 响应渲染。

### 路径别名

项目已配置 `@/` 作为 `src/` 目录的别名。

### 技术栈

- **Vue 3 (Composition API)**: 响应式核心。
- **Vite**: 构建工具，配置了路径别名。
- **HTML5 Video & Iframe API**: 视频播放核心。
- **OOP (面向对象编程)**: 封装视频处理逻辑。

## 开发建议
1. **逻辑分离**: 业务逻辑留在 `utils/`，组件仅负责 UI 与交互。
2. **状态共享**: 跨组件状态（如透明度、全屏）统一放入 `store.js`。
3. **多端适配**: 窗口拖拽与缩放已兼容触屏事件（`touchstart`, `touchmove`）。
