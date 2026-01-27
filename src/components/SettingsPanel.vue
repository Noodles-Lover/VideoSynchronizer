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
          <button class="upload-btn" @click="$refs.viewerFileInput.click()">上传</button>
          <input type="file" ref="viewerFileInput" accept="video/*" @change="handleFileUpload($event, 'viewer')" style="display: none" />
          <input v-model.number="store.viewer.startTime" type="number" placeholder="秒" @input="handleUrlInput('viewer')" class="time-input" />
        </div>
      </div>
      <div class="field">
        <label :style="{ color: store.animeColor }">动漫方 URL</label>
        <div class="input-with-time">
          <input v-model="store.anime.rawUrl" placeholder="yt链接或直链" @input="handleUrlInput('anime')" />
          <button class="upload-btn" @click="$refs.animeFileInput.click()">上传</button>
          <input type="file" ref="animeFileInput" accept="video/*" @change="handleFileUpload($event, 'anime')" style="display: none" />
          <input v-model.number="store.anime.startTime" type="number" placeholder="秒" @input="handleUrlInput('anime')" class="time-input" />
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
        <label>面板透明度</label>
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
        <div class="sync-play-group">
          <button class="sync-play-btn" @click="handleSyncPlay">
            <span>▶</span> 同时播放
          </button>
          <div class="forward-controls">
            <span class="forward-label">前进</span>
            <div class="time-inputs">
              <input v-model.number="store.forwardMinutes" type="number" placeholder="0" class="forward-input" />
              <span>分</span>
              <input v-model.number="store.forwardSeconds" type="number" placeholder="0" class="forward-input" />
              <span>秒</span>
            </div>
            <button class="reset-btn" @click="resetForwardTime" title="重置时间">↺</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { store } from '@/utils/store'
import { useYouTube } from '@/utils/useYouTube'
import { eventBus } from '@/utils/eventBus'
import { createPlayer, LocalVideo } from '@/utils/VideoPlayer'

const showSettings = ref(true)
const { isYouTube } = useYouTube()

const handleFileUpload = (event, type) => {
  const file = event.target.files[0]
  if (!file) return

  const player = new LocalVideo()
  player.load(file)
  
  if (type === 'viewer') {
    store.viewer = player
  } else {
    store.anime = player
  }
}

const handleUrlInput = (type) => {
  const isViewer = type === 'viewer'
  const player = isViewer ? store.viewer : store.anime
  const rawUrl = player.rawUrl
  
  // 如果是本地文件标记，不执行重载逻辑，仅更新显示
  if (rawUrl && rawUrl.startsWith('本地文件: ')) {
    return
  }

  // 使用工厂函数创建或更新播放器
  const newPlayer = createPlayer(rawUrl)
  
  // 保留现有的 startTime，除非 URL 中自带了时间戳（针对 YouTube）
  if (newPlayer.type === 'youtube' && newPlayer.startTime > 0) {
    // YouTube 类会自动从 URL 解析 startTime
  } else {
    newPlayer.startTime = player.startTime
  }

  if (isViewer) store.viewer = newPlayer
  else store.anime = newPlayer
}

const handleSyncPlay = () => {
  const totalOffset = (store.forwardMinutes || 0) * 60 + (store.forwardSeconds || 0)
  // 发送带有偏移量的同步信号
  eventBus.emit('sync-forward', totalOffset)
}

const resetForwardTime = () => {
  store.forwardMinutes = 0
  store.forwardSeconds = 0
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
.field input { flex: 1; padding: 0.6vw 0.8vw; border: 1px solid #d0d7de; border-radius: 6px; font-size: clamp(12px, 1vw, 16px); background: rgba(255, 255, 255, 0.8); min-width: 0; }
.upload-btn {
  padding: 0.6vw 1vw;
  background: #f6f8fa;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  font-size: clamp(11px, 0.9vw, 14px);
  color: #24292f;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.upload-btn:hover { background: #f3f4f6; border-color: #1b1f2426; }
.upload-btn:active { background: #ebecf0; }
.input-with-time { flex: 1; display: flex; gap: 0.5vw; align-items: center; }
.time-input { width: 3.5vw !important; min-width: 45px !important; flex: none !important; text-align: center; }
.radio-group { display: flex; gap: 1vw; font-size: clamp(12px, 0.9vw, 15px); color: #444; }
.radio-group label { display: flex; align-items: center; gap: 0.3vw; cursor: pointer; width: auto; }
.slider-group { flex: 1; display: flex; align-items: center; gap: 1vw; }
.slider-group input[type="range"] { flex: 1; cursor: pointer; }
.opacity-value { font-size: clamp(11px, 0.9vw, 14px); color: #666; min-width: 35px; }

.forward-input { 
  width: 2.5vw !important; 
  min-width: 35px !important; 
  flex: none !important; 
  text-align: center; 
  padding: 0.3vw !important; 
  border: 1px solid #d0d7de;
  border-radius: 4px;
  background: white;
}

.actions { margin-top: 1vw; }
.sync-play-group {
  display: flex;
  align-items: stretch;
  gap: 0.8vw;
  width: 100%;
}
.sync-play-btn {
  flex: 1;
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
.forward-controls {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4vw;
  font-size: clamp(12px, 0.9vw, 15px);
  color: #666;
  background: #f6f8fa;
  padding: 0.4vw 0.8vw;
  border-radius: 6px;
  border: 1px solid #d0d7de;
}
.forward-label {
  font-weight: 500;
  color: #444;
  white-space: nowrap;
}
.time-inputs {
  display: flex;
  align-items: center;
  gap: 0.3vw;
}
.reset-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 1.2vw;
  padding: 0 0.2vw;
  transition: color 0.2s, transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.reset-btn:hover {
  color: #666;
  transform: rotate(-90deg);
}
.sync-play-btn:hover { background: #2c974b; transform: translateY(-1px); }
.sync-play-btn:active { background: #298e46; transform: translateY(0); box-shadow: inset 0 3px 5px rgba(0,0,0,0.1); }
.sync-play-btn span { font-size: 1vw; }
</style>