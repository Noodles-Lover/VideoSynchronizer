<script setup>
import { ref } from 'vue'
import { store } from '@/utils/store'
import { useWindowManagement } from '@/utils/useWindowManagement'
import { useYouTube } from '@/utils/useYouTube'
import SettingsPanel from '@/components/SettingsPanel.vue'
import VideoPane from '@/components/VideoPane.vue'
import moveIcon from '@/assets/move.svg'
import zoomIcon from '@/assets/zoom.svg'

// 解析 YouTube 视频 ID（支持 watch?v=、youtu.be、/shorts/、/embed/）
const { getYouTubeId, buildYouTubeEmbed, isYouTube } = useYouTube()

// 窗口系统：自由拖动/缩放/重叠（无可见外框）
const { 
  windows, 
  drag,
  bringToFront, 
  onPaneMouseDown, 
  onResizeMouseDown, 
  onWindowsMouseMove, 
  onWindowsMouseUp 
} = useWindowManagement()
</script>

<template>
  <div class="app-root">
    <!-- <p>beta 1.3</p> -->
    
    <!-- 设置按钮与面板 -->
    <SettingsPanel />

    <!-- 可拖拽/缩放/重叠窗口容器 -->
    <div class="windows" 
      @mousemove="onWindowsMouseMove" 
      @mouseup="onWindowsMouseUp"
      @touchmove="onWindowsMouseMove"
      @touchend="onWindowsMouseUp"
    >
      <VideoPane
        v-for="win in windows"
        :key="win.id"
        :win="win"
        :paneId="win.id"
        :player="win.id === 'viewer' ? store.viewer : store.anime"
        :bgColor="win.id === 'viewer' ? store.viewerColor : store.animeColor"
        :onPaneMouseDown="onPaneMouseDown"
        :onResizeMouseDown="onResizeMouseDown"
        :class="{ 'is-fullscreen': store.fullScreen === win.id }"
      />
    </div>

    <!-- 拖拽/缩放提示圖標 -->
    <div v-if="drag.isDragging || drag.isResizing" 
      class="drag-cursor-hint"
      :style="{ left: drag.currentX + 'px', top: drag.currentY + 'px' }"
    >
      <img :src="drag.isDragging ? moveIcon : zoomIcon" alt="hint" />
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

.drag-cursor-hint {
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.drag-cursor-hint img {
  width: 24px;
  height: 24px;
  filter: invert(1);
}
</style>







