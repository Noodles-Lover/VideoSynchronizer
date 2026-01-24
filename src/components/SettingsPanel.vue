<template>
  <div class="settings" :class="[store.settingsPosition, { open: showSettings }]">
    <button 
      class="settings-btn" 
      @click="showSettings = !showSettings"
      :style="{ opacity: store.settingsOpacity }"
    >⚙️</button>
    <div 
      class="panel" 
      v-if="showSettings"
      :style="{ opacity: store.settingsOpacity }"
    >
      <div class="field">
        <label :style="{ color: store.viewerColor }">视听方 URL</label>
        <div class="input-with-time">
          <input v-model="store.viewer.rawUrl" placeholder="yt链接或直链" @input="handleUrlInput('viewer')" />
          <input v-model.number="store.viewer.startTime" type="number" placeholder="秒" @input="handleUrlInput('viewer')" class="time-input" />
        </div>
      </div>
      <div class="field">
        <label :style="{ color: store.animeColor }">動漫方 URL</label>
        <div class="input-with-time">
          <input v-model="store.anime.rawUrl" placeholder="yt链接或直链" @input="handleUrlInput('anime')" />
          <input v-model.number="store.anime.startTime" type="number" placeholder="秒" @input="handleUrlInput('anime')" class="time-input" />
        </div>
        <div class="file-upload">
          <label class="file-label">或上传本地视频: </label>
          <input type="file" accept="video/*" @change="handleFileUpload" />
        </div>
      </div>
      <div class="field">
        <label>按钮位置</label>
        <div class="radio-group">
          <label><input type="radio" value="left" v-model="store.settingsPosition" /> 左上角</label>
          <label><input type="radio" value="right" v-model="store.settingsPosition" /> 右上角</label>
        </div>
      </div>
      <div class="field">
        <label>强制置顶</label>
        <div class="radio-group">
          <label><input type="radio" value="none" v-model="store.forcedTop" /> 无</label>
          <label><input type="radio" value="viewer" v-model="store.forcedTop" /> 视听方</label>
          <label><input type="radio" value="anime" v-model="store.forcedTop" /> 动漫方</label>
        </div>
      </div>
      <div class="field">
        <label>全屏显示</label>
        <div class="radio-group">
          <label><input type="radio" value="none" v-model="store.fullScreen" /> 无</label>
          <label><input type="radio" value="viewer" v-model="store.fullScreen" /> 视听方</label>
          <label><input type="radio" value="anime" v-model="store.fullScreen" /> 动漫方</label>
        </div>
      </div>
      <div class="field">
        <label>不透明度</label>
        <div class="slider-group">
          <input 
            type="range" 
            min="0.1" 
            max="1" 
            step="0.05" 
            v-model.number="store.settingsOpacity" 
          />
          <span class="opacity-value">{{ Math.round(store.settingsOpacity * 100) }}%</span>
        </div>
      </div>
      <div class="actions">
        <button class="sync-play-btn" @click="handleSyncPlay">
          <span>▶</span> 同时播放
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { store } from '../store'
import { useYouTube } from '../composables/useYouTube'
import { eventBus } from '../utils/eventBus'
import { createPlayer, LocalVideo } from '../models/VideoPlayer'

const showSettings = ref(true)
const { isYouTube } = useYouTube()

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const player = new LocalVideo()
  player.load(file)
  store.anime = player
}

const handleUrlInput = (type) => {
  const isViewer = type === 'viewer'
  const player = isViewer ? store.viewer : store.anime
  const rawUrl = player.rawUrl
  
  // 如果是本地文件標記，不執行重載邏輯，僅更新顯示
  if (rawUrl && rawUrl.startsWith('本地文件: ')) {
    return
  }

  // 根據輸入創建對應的播放器實例
  if (isYouTube(rawUrl)) {
    if (player.type !== 'youtube') {
      const newPlayer = createPlayer(rawUrl)
      if (isViewer) store.viewer = newPlayer
      else store.anime = newPlayer
    } else {
      player.load(rawUrl)
    }
  } else {
    if (player.type !== 'local' || (player.rawUrl !== rawUrl && !rawUrl.startsWith('本地文件: '))) {
      const newPlayer = createPlayer(rawUrl)
      if (isViewer) store.viewer = newPlayer
      else store.anime = newPlayer
    } else {
      player.load(rawUrl)
    }
  }
}

const handleSyncPlay = () => {
  // 僅透過 Event Bus 發送全局同步播放信號，具體播放邏輯交由播放器組件處理
  eventBus.emit('sync-play')
}
</script>

<style scoped>
.settings { position: absolute; top: 16px; z-index: 1000; display: flex; flex-direction: column; }
.settings.right { right: 16px; align-items: flex-end; }
.settings.left { left: 16px; align-items: flex-start; }

.settings-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid #d0d7de; background: #fff; cursor: pointer; transition: opacity 0.2s; }
.panel { 
  margin-top: 8px; 
  background: rgba(255, 255, 255, 0.9); 
  backdrop-filter: blur(8px);
  color: #111; 
  border: 1px solid #d0d7de; 
  border-radius: 8px; 
  padding: 1.5vw; 
  width: 50vw; 
  min-width: 400px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08); 
  display: flex;
  flex-direction: column;
}
.field { display: flex; flex-wrap: wrap; align-items: center; gap: 1vw; margin-bottom: 1.5vw; }
.file-upload { width: 100%; display: flex; align-items: center; margin-top: 0.5vw; margin-left: 9vw; }
.file-label { font-size: clamp(12px, 0.9vw, 14px); color: #666; margin-right: 0.5vw; width: auto !important; min-width: auto !important; }
.field label { width: 8vw; min-width: 90px; font-size: clamp(13px, 1.2vw, 18px); color: #444; font-weight: 500; }
.field input { flex: 1; padding: 0.6vw 0.8vw; border: 1px solid #d0d7de; border-radius: 6px; font-size: clamp(12px, 1vw, 16px); background: rgba(255, 255, 255, 0.8); }
.input-with-time { flex: 1; display: flex; gap: 0.5vw; }
.time-input { width: 4vw !important; min-width: 50px !important; flex: none !important; text-align: center; }
.radio-group { display: flex; gap: 1vw; font-size: clamp(12px, 0.9vw, 15px); color: #444; }
.radio-group label { display: flex; align-items: center; gap: 0.3vw; cursor: pointer; width: auto; }
.slider-group { flex: 1; display: flex; align-items: center; gap: 1vw; }
.slider-group input[type="range"] { flex: 1; cursor: pointer; }
.opacity-value { font-size: clamp(11px, 0.9vw, 14px); color: #666; min-width: 35px; }
.actions { margin-top: 1vw; display: flex; justify-content: center; }
.sync-play-btn {
  width: 100%;
  padding: 0.8vw;
  background: #2ea44f;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: clamp(13px, 1.1vw, 18px);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5vw;
  transition: all 0.2s;
}
.sync-play-btn:hover { background: #2c974b; transform: translateY(-1px); }
.sync-play-btn:active { background: #298e46; transform: translateY(0); box-shadow: inset 0 3px 5px rgba(0,0,0,0.1); }
.sync-play-btn span { font-size: 1vw; }
</style>