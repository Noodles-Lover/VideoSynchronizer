<template>
  <transition name="fade">
    <div v-if="visible" class="side-toolbar" @click.stop>
      <div class="toolbar-content">
        <!-- 置顶按钮 -->
        <button 
          class="tool-btn" 
          :class="{ active: store.forcedTop === paneId }"
          @click="togglePin"
          title="置顶"
        >📌</button>
        
        <!-- 全屏按钮 -->
        <button 
          class="tool-btn" 
          :class="{ active: store.fullScreen === paneId }"
          @click="toggleFullScreen"
          title="全屏"
        >🔲</button>

        <!-- 不透明度滑块 -->
        <div class="opacity-slider-container">
          <input 
            type="range" 
            min="0.2" 
            max="1" 
            step="0.05" 
            orient="vertical"
            v-model.number="currentOpacity" 
            class="opacity-slider"
          />
        </div>

        <!-- 视频设置按钮 -->
        <button class="tool-btn" @click="showInputModal = !showInputModal" title="视频设置">⚙️</button>
      </div>

      <!-- 快速输入弹窗 -->
      <transition name="slide">
        <div v-if="showInputModal" class="input-modal" @click.stop>
          <div class="modal-header">
            <span>{{ paneId === 'viewer' ? '视听方' : '动漫方' }} 设置</span>
            <button class="close-btn" @click="showInputModal = false">×</button>
          </div>
          <div class="modal-body">
            <div class="input-row">
              <input v-model="targetPlayer.rawUrl" placeholder="YouTube 或 直链" @input="handleUrlInput" />
              <button class="mini-upload-btn" @click="$refs.fileInput.click()">上传</button>
              <input type="file" ref="fileInput" accept="video/*" @change="handleFileUpload" style="display: none" />
            </div>
            <div class="input-row">
              <label>开始时间 (秒):</label>
              <input v-model.number="targetPlayer.startTime" type="number" placeholder="秒" @input="handleUrlInput" class="time-input" />
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { store } from '@/utils/store'
import { LocalVideo } from '@/utils/VideoPlayer'
import { useYouTube } from '@/utils/useYouTube'

const props = defineProps({
  trigger: {
    type: Number,
    default: 0
  },
  paneId: {
    type: String,
    required: true
  }
})

const visible = ref(false)
const showInputModal = ref(false)
let timer = null

const { isYouTube, buildYouTubeEmbed } = useYouTube()

const targetPlayer = computed(() => props.paneId === 'viewer' ? store.viewer : store.anime)

const currentOpacity = computed({
  get: () => props.paneId === 'viewer' ? store.viewerOpacity : store.animeOpacity,
  set: (val) => {
    if (props.paneId === 'viewer') {
      store.viewerOpacity = val
    } else {
      store.animeOpacity = val
    }
  }
})

const handleUrlInput = () => {
  const player = targetPlayer.value
  if (player.type === 'local') return
  
  if (isYouTube(player.rawUrl)) {
    player.type = 'youtube'
    player.embedUrl = buildYouTubeEmbed(player.rawUrl, player.startTime)
  } else if (player.rawUrl) {
    player.type = 'direct'
    player.embedUrl = player.rawUrl
  }
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  const player = new LocalVideo()
  player.load(file)
  if (props.paneId === 'viewer') {
    store.viewer = player
  } else {
    store.anime = player
  }
}

const togglePin = () => {
  if (store.forcedTop === props.paneId) {
    store.forcedTop = 'none'
  } else {
    store.forcedTop = props.paneId
  }
}

const toggleFullScreen = () => {
  if (store.fullScreen === props.paneId) {
    store.fullScreen = 'none'
  } else {
    store.fullScreen = props.paneId
  }
}

const showToolbar = () => {
  visible.value = true
  if (timer) clearTimeout(timer)
  // 如果弹窗打开，不自动消失
  if (!showInputModal.value) {
    timer = setTimeout(() => {
      visible.value = false
    }, 4000)
  }
}

// 监听弹窗状态，如果关闭则重置定时器
watch(showInputModal, (val) => {
  if (!val) {
    showToolbar()
  } else {
    if (timer) clearTimeout(timer)
  }
})

// 监听外部触发信号（计数器变化）
watch(() => props.trigger, () => {
  showToolbar()
})

defineExpose({
  show: showToolbar
})
</script>

<style scoped>
.side-toolbar {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  pointer-events: auto;
  display: flex;
  align-items: center;
  opacity: 0.85;
}

.toolbar-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 12px 6px;
  background: white;
  backdrop-filter: blur(8px);
  border-radius: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.tool-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.05);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
}

.tool-btn:hover {
  background: #f0f0f0;
  transform: scale(1.1);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.18);
}

.tool-btn:active {
  transform: scale(0.95);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.tool-btn.active {
  background: #3498db;
  color: white;
  border-color: #2980b9;
  box-shadow: 0 2px 6px rgba(52, 152, 219, 0.4);
}

.opacity-slider-container {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 0;
}

.opacity-slider {
  -webkit-appearance: slider-vertical;
  width: 8px;
  height: 80px;
  padding: 0 5px;
  cursor: pointer;
}

/* 輸入彈窗樣式 */
.input-modal {
  position: absolute;
  right: 50px;
  background: white;
  backdrop-filter: blur(8px);
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 6px 25px rgba(0,0,0,0.25);
  border: 1px solid rgba(0, 0, 0, 0.1);
  width: 240px;
  z-index: 101;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
}

.input-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

.input-row input {
  flex: 1;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}

.time-input {
  max-width: 60px;
}

.mini-upload-btn {
  padding: 4px 8px;
  background: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
}

/* 動畫 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-50%) translateX(10px); }

.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateX(20px); }
</style>
