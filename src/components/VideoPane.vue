<template>
  <div class="pane"
    :style="{ left: win.x + 'px', top: win.y + 'px', width: win.w + 'px', height: win.h + 'px', zIndex: win.z }"
    @mousedown="onPaneMouseDown(win, $event)"
  >
    <!-- 頂部不可見拖拽區，避免 iframe 阻斷拖拽事件 -->
    <div class="drag-handle" @mousedown="onPaneMouseDown(win, $event)"></div>

    <div class="content">
      <!-- 视听方或動漫方内容：纯视频 -->
      <iframe v-if="isYouTube(videoUrl) && getYouTubeId(videoUrl)"
              :src="buildYouTubeEmbed(videoUrl)"
              class="yt-iframe"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen></iframe>
      <video v-else :src="videoUrl" playsinline controls></video>
    </div>
    
    <!-- 右下角隐形缩放区域 -->
    <div class="resize-handle" @mousedown.stop="onResizeMouseDown(win, $event)"></div>
  </div>
</template>

<script setup>
import { useYouTube } from '../composables/useYouTube'

const props = defineProps({
  videoUrl: String,
  paneId: String,
  win: Object,
  onPaneMouseDown: Function,
  onResizeMouseDown: Function,
})

const { getYouTubeId, buildYouTubeEmbed, isYouTube } = useYouTube()
</script>

<style scoped>
.pane { position: absolute; background: #000; overflow: hidden; display: flex; flex-direction: column; }
.drag-handle { position: absolute; top: 0; left: 0; right: 0; height: 40px; z-index: 10; cursor: move; }
.content { flex: 1; position: relative; width: 100%; height: 100%; }
.yt-iframe, video { width: 100%; height: 100%; display: block; object-fit: contain; }
.resize-handle { position: absolute; right: 0; bottom: 0; width: 20px; height: 20px; cursor: nwse-resize; z-index: 20; }
</style>