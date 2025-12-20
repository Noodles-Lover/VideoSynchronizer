<template>
  <div class="settings">
    <button class="settings-btn" @click="showSettings = !showSettings">⚙️</button>
    <div class="panel" v-if="showSettings">
      <div class="field">
        <label :style="{ color: store.viewerColor }">视听方 URL</label>
        <div class="input-with-time">
          <input v-model="store.viewerUrl" placeholder="yt链接或直链" @input="handleUrlInput('viewer')" />
          <input v-model.number="store.viewerStartTime" type="number" placeholder="秒" class="time-input" />
        </div>
      </div>
      <div class="field">
        <label :style="{ color: store.animeColor }">動漫方 URL</label>
        <div class="input-with-time">
          <input v-model="store.animeUrl" placeholder="yt链接或直链" @input="handleUrlInput('anime')" />
          <input v-model.number="store.animeStartTime" type="number" placeholder="秒" class="time-input" />
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
      <div class="hint">提示：視窗可自由拖曳與縮放。</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { store } from '../store'
import { useYouTube } from '../composables/useYouTube'

const showSettings = ref(true)
const { getYouTubeTimestamp } = useYouTube()

const handleUrlInput = (type) => {
  const url = type === 'viewer' ? store.viewerUrl : store.animeUrl
  const timestamp = getYouTubeTimestamp(url)
  if (timestamp > 0) {
    if (type === 'viewer') {
      store.viewerStartTime = timestamp
    } else {
      store.animeStartTime = timestamp
    }
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
.hint { font-size: 12px; color: #666; }
</style>