<script setup>
import { reactive, ref } from 'vue'
import { useWindowManagement } from './composables/useWindowManagement'
import { useYouTube } from './composables/useYouTube'
import SettingsPanel from './components/SettingsPanel.vue'
import VideoPane from './components/VideoPane.vue'

// 状态：URL
const state = reactive({
  viewer: '',
  anime: '',
})

// 解析 YouTube 视频 ID（支持 watch?v=、youtu.be、/shorts/、/embed/）
const { getYouTubeId, buildYouTubeEmbed, isYouTube } = useYouTube()

// 窗口系统：自由拖动/缩放/重叠（无可见外框）
const { 
  windows, 
  forcedTop, 
  setForcedTop, 
  fullScreen,
  setFullScreen,
  bringToFront, 
  onPaneMouseDown, 
  onResizeMouseDown, 
  onWindowsMouseMove, 
  onWindowsMouseUp 
} = useWindowManagement()

// 设置面板可见性
const showSettings = ref(true)
</script>

<template>
  <div class="app-root">
    <!-- 设置按钮与面板 -->
    <SettingsPanel
      :viewerUrl="state.viewer"
      :animeUrl="state.anime"
      :forcedTop="forcedTop"
      :fullScreen="fullScreen"
      @update:viewerUrl="state.viewer = $event"
      @update:animeUrl="state.anime = $event"
      @update:forcedTop="setForcedTop"
      @update:fullScreen="setFullScreen"
    />

    <!-- 可拖拽/缩放/重叠窗口容器 -->
    <div class="windows" @mousemove="onWindowsMouseMove" @mouseup="onWindowsMouseUp">
      <VideoPane
        v-for="win in windows"
        :key="win.id"
        :win="win"
        :paneId="win.id"
        :videoUrl="win.id === 'viewer' ? state.viewer : state.anime"
        :onPaneMouseDown="onPaneMouseDown"
        :onResizeMouseDown="onResizeMouseDown"
        :class="{ 'is-fullscreen': fullScreen === win.id }"
      />
    </div>
  </div>
</template>

<style scoped>
.app-root { width: 100vw; height: 100vh; overflow: hidden; }

/* 窗口系统：纯视频，无边框/标题栏 */
.windows { position: absolute; inset: 0; }

.is-fullscreen {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  transform: none !important;
}
</style>

