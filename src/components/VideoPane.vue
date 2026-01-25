<template>
  <div class="pane"
    :style="{ left: win.x + 'px', top: win.y + 'px', width: win.w + 'px', height: win.h + 'px', zIndex: win.z, backgroundColor: bgColor }"
    @mousedown="onPaneMouseDown(win, $event)"
    @touchstart.passive="onPaneMouseDown(win, $event)"
  >
    <!-- 頂部不可見拖拽區，避免 iframe 阻斷拖拽事件 -->
    <div class="drag-handle" 
      @mousedown="onPaneMouseDown(win, $event)"
      @touchstart.passive="onPaneMouseDown(win, $event)"
    ></div>

    <div class="content">
      <!-- 视听方或動漫方内容：纯视频 -->
      <div class="video-container">
        <template v-if="player.type === 'youtube'">
          <iframe
            :key="player.embedUrl"
            :src="player.embedUrl"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            referrerpolicy="no-referrer"
          ></iframe>
        </template>
        <video v-else-if="player.embedUrl" :src="player.embedUrl" controls ref="videoRef" referrerpolicy="no-referrer"></video>
      </div>
    </div>
    
    <!-- 右下角隐形缩放区域 -->
    <div class="resize-handle" 
      @mousedown.stop="onResizeMouseDown(win, $event)"
      @touchstart.stop.passive="onResizeMouseDown(win, $event)"
    ></div>
  </div>
</template>

<script setup>
import { store } from '@/utils/store'
import { ref, onMounted, onUnmounted } from 'vue'
import { eventBus } from '@/utils/eventBus'

const props = defineProps({
  win: Object,
  paneId: String,
  player: Object,
  bgColor: String,
  onPaneMouseDown: Function,
  onResizeMouseDown: Function
})

const videoRef = ref(null)

const handleSyncPlay = () => {
  props.player.play(videoRef.value)
}

onMounted(() => {
  eventBus.on('sync-play', handleSyncPlay)
})

onUnmounted(() => {
  eventBus.off('sync-play', handleSyncPlay)
})
</script>

<style scoped>
.pane { position: absolute; overflow: hidden; display: flex; flex-direction: column; touch-action: none; }
.drag-handle { position: absolute; top: 0; left: 0; right: 0; height: 40px; z-index: 10; cursor: move; touch-action: none; }
.content { flex: 1; position: relative; width: 100%; height: 100%; }
.video-container { width: 100%; height: 100%; }
.video-container iframe, .video-container video { width: 100%; height: 100%; display: block; object-fit: contain; border: none; }
.resize-handle { position: absolute; right: 0; bottom: 0; width: 20px; height: 20px; cursor: nwse-resize; z-index: 20; touch-action: none; }
</style>