<template>
  <div class="settings">
    <button class="settings-btn" @click="showSettings = !showSettings">⚙️</button>
    <div class="panel" v-if="showSettings">
      <div class="field">
        <label :style="{ color: store.viewerColor }">视听方 URL</label>
        <div class="input-with-time">
          <input v-model="store.viewerRawUrl" placeholder="yt链接或直链" @input="handleUrlInput('viewer')" />
          <input v-model.number="store.viewerStartTime" type="number" placeholder="秒" @input="handleUrlInput('viewer')" class="time-input" />
        </div>
      </div>
      <div class="field">
        <label :style="{ color: store.animeColor }">動漫方 URL</label>
        <div class="input-with-time">
          <input v-model="store.animeRawUrl" placeholder="yt链接或直链" @input="handleUrlInput('anime')" />
          <input v-model.number="store.animeStartTime" type="number" placeholder="秒" @input="handleUrlInput('anime')" class="time-input" />
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
      <div class="actions">
        <button class="sync-play-btn" @click="handleSyncPlay">
          <span>▶</span> 同时播放
        </button>
      </div>
      <div class="hint">提示：視窗可自由拖曳與縮放。</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { store } from '../store'
import { useYouTube } from '../composables/useYouTube'

const showSettings = ref(true)
const { getYouTubeTimestamp, stripYouTubeTimestamp, buildYouTubeEmbed, isYouTube } = useYouTube()

const handleUrlInput = (type) => {
  const isViewer = type === 'viewer'
  let url = isViewer ? store.viewerRawUrl : store.animeRawUrl
  
  // 提取時間戳
  const timestamp = getYouTubeTimestamp(url)
  if (timestamp > 0) {
    if (isViewer) store.viewerStartTime = timestamp
    else store.animeStartTime = timestamp
    
    // 移除原始連結中的時間戳參數
    url = stripYouTubeTimestamp(url)
    if (isViewer) store.viewerRawUrl = url
    else store.animeRawUrl = url
  }

  // 構造 Embed URL
  const startTime = isViewer ? store.viewerStartTime : store.animeStartTime
  if (isYouTube(url)) {
    const embedUrl = buildYouTubeEmbed(url, startTime, false)
    if (isViewer) store.viewerEmbedUrl = embedUrl
    else store.animeEmbedUrl = embedUrl
  } else {
    if (isViewer) store.viewerEmbedUrl = url
    else store.animeEmbedUrl = url
  }
}

const handleSyncPlay = () => {
  // 直接在已有的 embedUrl 後加上 autoplay 參數觸發重載
  const appendAutoplay = (url) => {
    if (!url) return ''
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}autoplay=1`
  }

  if (store.viewerEmbedUrl) {
    store.viewerEmbedUrl = appendAutoplay(store.viewerEmbedUrl)
  }
  if (store.animeEmbedUrl) {
    store.animeEmbedUrl = appendAutoplay(store.animeEmbedUrl)
  }
}
</script>

<style scoped>
.settings { position: absolute; right: 16px; top: 16px; z-index: 1000; }
.settings-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid #d0d7de; background: #fff; cursor: pointer; }
.panel { margin-top: 8px; background: #fff; color: #111; border: 1px solid #d0d7de; border-radius: 8px; padding: 12px; width: 380px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.field { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.field label { width: 100px; font-size: 13px; color: #444; }
.field input { flex: 1; padding: 8px 10px; border: 1px solid #d0d7de; border-radius: 6px; font-size: 14px; }
.input-with-time { flex: 1; display: flex; gap: 8px; }
.time-input { width: 60px !important; flex: none !important; text-align: center; }
.radio-group { display: flex; gap: 12px; font-size: 13px; color: #444; }
.radio-group label { display: flex; align-items: center; gap: 4px; cursor: pointer; width: auto; }
.actions { margin-top: 16px; display: flex; justify-content: center; }
.sync-play-btn {
  width: 100%;
  padding: 10px;
  background: #2ea44f;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}
.sync-play-btn:hover { background: #2c974b; transform: translateY(-1px); }
.sync-play-btn:active { background: #298e46; transform: translateY(0); box-shadow: inset 0 3px 5px rgba(0,0,0,0.1); }
.sync-play-btn span { font-size: 12px; }
.hint { font-size: 12px; color: #666; margin-top: 12px; text-align: center; }
</style>