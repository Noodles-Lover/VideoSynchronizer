<template>
  <div class="settings">
    <button class="settings-btn" @click="showSettings = !showSettings">⚙️</button>
    <div class="panel" v-if="showSettings">
      <div class="field">
        <label>视听方 URL</label>
        <input v-model="state.viewer" placeholder="yt链接或直链" />
      </div>
      <div class="field">
        <label>動漫方 URL</label>
        <input v-model="state.anime" placeholder="yt链接或直链" />
      </div>
      <div class="field">
        <label>强制置顶</label>
        <div class="radio-group">
          <label><input type="radio" value="none" v-model="state.forcedTop" /> 无</label>
          <label><input type="radio" value="viewer" v-model="state.forcedTop" /> 视听方</label>
          <label><input type="radio" value="anime" v-model="state.forcedTop" /> 动漫方</label>
        </div>
      </div>
      <div class="hint">提示：視窗可自由拖曳與縮放。</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  viewerUrl: String,
  animeUrl: String,
  forcedTop: String,
})

const emit = defineEmits(['update:viewerUrl', 'update:animeUrl', 'update:forcedTop'])

const showSettings = ref(true)

const state = reactive({
  viewer: props.viewerUrl,
  anime: props.animeUrl,
  forcedTop: props.forcedTop || 'none',
})

watch(() => props.viewerUrl, (newVal) => { state.viewer = newVal })
watch(() => props.animeUrl, (newVal) => { state.anime = newVal })
watch(() => props.forcedTop, (newVal) => { state.forcedTop = newVal })

watch(() => state.viewer, (newVal) => { emit('update:viewerUrl', newVal) })
watch(() => state.anime, (newVal) => { emit('update:animeUrl', newVal) })
watch(() => state.forcedTop, (newVal) => { emit('update:forcedTop', newVal) })
</script>

<style scoped>
.settings { position: absolute; right: 16px; top: 16px; z-index: 1000; }
.settings-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid #d0d7de; background: #fff; cursor: pointer; }
.panel { margin-top: 8px; background: #fff; color: #111; border: 1px solid #d0d7de; border-radius: 8px; padding: 12px; width: 380px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.field { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.field label { width: 100px; font-size: 13px; color: #444; }
.field input { flex: 1; padding: 8px 10px; border: 1px solid #d0d7de; border-radius: 6px; font-size: 14px; }
.radio-group { display: flex; gap: 12px; font-size: 13px; color: #444; }
.radio-group label { display: flex; align-items: center; gap: 4px; cursor: pointer; width: auto; }
.hint { font-size: 12px; color: #666; }
</style>