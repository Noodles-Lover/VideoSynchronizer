<template>
  <div class="pane"
    :style="{ 
      left: win.x + 'px', 
      top: win.y + 'px', 
      width: win.w + 'px', 
      height: win.h + 'px', 
      zIndex: win.z, 
      backgroundColor: bgColor,
      opacity: paneId === 'viewer' ? store.viewerOpacity : store.animeOpacity
    }"
    @click="triggerToolbar"
  >
    <!-- 顶部不可见拖拽区 -->
    <div class="drag-handle" 
      @mousedown="onPaneMouseDown(win, $event)"
      @touchstart.passive="onPaneMouseDown(win, $event)"
    ></div>

    <div class="content">
      <!-- 视听方或动漫方内容：纯视频 -->
      <div class="video-container">
        <template v-if="player.type === 'youtube'">
          <iframe
            :key="player.embedUrl"
            :src="player.embedUrl"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </template>
        <video v-else-if="player.embedUrl" :src="player.embedUrl" controls ref="videoRef" referrerpolicy="no-referrer"></video>
      </div>

      <!-- 侧边工具栏 -->
      <SideToolbar :trigger="toolbarTrigger" :pane-id="paneId" />
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
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { eventBus } from '@/utils/eventBus'
import SideToolbar from './SideToolbar.vue'

const props = defineProps({
  win: Object,
  paneId: String,
  player: Object,
  bgColor: String,
  onPaneMouseDown: Function,
  onResizeMouseDown: Function
})

const videoRef = ref(null)
const toolbarTrigger = ref(0)

const triggerToolbar = () => {
  toolbarTrigger.value++
}

// 监听窗口位置变化（移动时触发）
watch([() => props.win.x, () => props.win.y], () => {
  triggerToolbar()
})

const handleSyncPlay = () => {
  props.player.play(videoRef.value)
}

const handleSyncForward = (offsetSeconds) => {
  props.player.seekAndPlay(videoRef.value, offsetSeconds)
}

onMounted(() => {
  eventBus.on('sync-play', handleSyncPlay)
  eventBus.on('sync-forward', handleSyncForward)
})

onUnmounted(() => {
  eventBus.off('sync-play', handleSyncPlay)
  eventBus.off('sync-forward', handleSyncForward)
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