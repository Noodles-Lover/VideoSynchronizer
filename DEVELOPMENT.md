# VideoSynchronizer 開發文檔

這是一個基於 Vue 3 和 Vite 開發的網頁工具，旨在讓使用者能夠同步觀看兩個視頻（如動漫與反應視頻）。本文件旨在介紹項目的結構、各文件的職責以及核心邏輯。

## 目錄結構

```text
VideoSynchronizer/
├── .github/workflows/      # GitHub Actions 自動部署配置
├── public/                 # 靜態資源
├── src/
│   ├── assets/             # SVG 圖標資源
│   ├── components/         # Vue 組件
│   │   ├── SettingsPanel.vue # 設置面板組件
│   │   └── VideoPane.vue     # 視頻窗格組件
│   ├── composables/        # 邏輯封裝 (Hooks)
│   │   ├── useWindowManagement.js # 窗口管理邏輯 (拖拽、縮放、層級)
│   │   └── useYouTube.js         # YouTube URL 解析與處理邏輯
│   ├── models/             # 數據模型 (新增)
│   │   └── VideoPlayer.js        # 視頻播放器抽象類與實現
│   ├── utils/              # 通用工具函數
│   │   └── eventBus.js           # 全局事件總線 (Event Bus)
│   ├── App.vue             # 根組件
│   ├── main.js             # 項目入口文件
│   ├── store.js            # 全局狀態管理
│   └── style.css           # 全局樣式
├── index.html              # HTML 模板
├── package.json            # 依賴配置
└── vite.config.js          # Vite 配置文件
```

### 核心文件說明

- **src/models/VideoPlayer.js** (新增)
  - 視頻播放器的抽象體系。
  - `VideoPlayer`: 抽象基類，定義了 `displayText`, `rawUrl`, `embedUrl`, `startTime` 等屬性。
  - `YouTubeVideo`: 繼承自 `VideoPlayer`，實現 YouTube 特有的加載（ID 提取、時間戳處理）和播放（URL 參數觸發）邏輯。
  - `LocalVideo`: 繼承自 `VideoPlayer`，實現本地文件 Blob URL 和直鏈視頻的加載與原生播放。
  - `createPlayer`: 工廠函數，根據輸入自動創建對應的播放器實例。

- **src/store.js**
  - 使用 Vue 3 `reactive` 管理全局狀態。
  - 存儲 `viewer` (視聽方) 和 `anime` (動漫方) 的 `VideoPlayer` 實例。
  - 存儲 UI 配置（顏色、全屏狀態、設置面板位置等）。

- **src/components/SettingsPanel.vue**
  - 設置面板，負責視頻 URL 輸入、本地文件上傳、顏色選擇等。
  - 調用 `VideoPlayer` 實例的 `load` 方法更新視頻狀態。
  - 通過 `eventBus` 發送同步播放信號。

- **src/components/VideoPane.vue**
  - 視頻展示窗口，負責渲染 `iframe` (YouTube) 或 `video` (本地/直鏈) 標籤。
  - 監聽 `eventBus` 的 `sync-play` 事件，並調用 `player.play()` 執行播放邏輯。
  - 處理窗口的拖拽和縮放顯示。

- **src/utils/eventBus.js**
  - 基於 Vue `reactive` 的簡易事件總線。
  - 用於跨組件通信，主要是觸發「同時播放」的操作。

- **src/composables/**
  - `useYouTube.js`: 封裝 YouTube URL 解析、ID 提取、Embed URL 構建等工具函數。
  - `useWindowManagement.js`: 封裝多窗口的拖拽、縮放、置頂等佈局邏輯。

### 數據流向

1. **視頻加載**: `SettingsPanel` -> `player.load(url/file)` -> 更新 `store.player` 屬性。
2. **同步播放**: `SettingsPanel` (點擊按鈕) -> `eventBus.emit('sync-play')` -> `VideoPane` (接收事件) -> `player.play(videoElement)`。
3. **窗口交互**: `App.vue` (全局鼠標監聽) -> `useWindowManagement` -> 更新 `windows` 坐標/大小 -> `VideoPane` 響應式渲染。

### 技術棧

- **Vue 3 (Composition API)**: 組件化與響應式邏輯。
- **Vite**: 構建與開發服務。
- **HTML5 Video & Iframe API**: 視頻播放核心。
- **CSS Grid/Flexbox**: 佈局。
- **Object Oriented Programming**: 使用類繼承封裝不同類型的視頻處理邏輯。

## 開發建議
1. **添加新功能**: 優先考慮將邏輯封裝在 `composables` 中，保持組件代碼簡潔。
2. **樣式管理**: 大部分組件樣式都寫在 `scoped` 中，全局基礎樣式定義在 `style.css`。
3. **狀態同步**: 盡量使用 `store.js` 進行組件間通信，避免過深的 Props 傳遞。
