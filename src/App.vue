<script setup>
import { ref } from 'vue'
import { store } from './store'
import { useWindowManagement } from './composables/useWindowManagement'
import { useYouTube } from './composables/useYouTube'
import SettingsPanel from './components/SettingsPanel.vue'
import VideoPane from './components/VideoPane.vue'

// 解析 YouTube 视频 ID（支持 watch?v=、youtu.be、/shorts/、/embed/）
const { getYouTubeId, buildYouTubeEmbed, isYouTube } = useYouTube()

// 窗口系统：自由拖动/缩放/重叠（无可见外框）
const { 
  windows, 
  bringToFront, 
  onPaneMouseDown, 
  onResizeMouseDown, 
  onWindowsMouseMove, 
  onWindowsMouseUp 
} = useWindowManagement()
</script>

<template>
  <div class="app-root">
    <!-- 设置按钮与面板 -->
    <SettingsPanel />

    <!-- 可拖拽/缩放/重叠窗口容器 -->
    <div class="windows" @mousemove="onWindowsMouseMove" @mouseup="onWindowsMouseUp">
      <VideoPane
        v-for="win in windows"
        :key="win.id"
        :win="win"
        :paneId="win.id"
        :videoUrl="win.id === 'viewer' ? store.viewerUrl : store.animeUrl"
        :startTime="win.id === 'viewer' ? store.viewerStartTime : store.animeStartTime"
        :bgColor="win.id === 'viewer' ? store.viewerColor : store.animeColor"
        :onPaneMouseDown="onPaneMouseDown"
        :onResizeMouseDown="onResizeMouseDown"
        :class="{ 'is-fullscreen': store.fullScreen === win.id }"
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




