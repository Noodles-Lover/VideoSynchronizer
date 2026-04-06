import { reactive, watch } from 'vue'
import { createPlayer } from '@/utils/VideoPlayer'

export const store = reactive({
  viewer: createPlayer(''),
  anime: createPlayer(''),
  viewerColor: '#3498db', // 蓝色
  animeColor: '#e74c3c',  // 红色
  forcedTop: 'none',
  fullScreen: 'none',
  settingsPosition: 'right', // 'left' or 'right'
  settingsOpacity: 0.85,
  viewerOpacity: 1,
  animeOpacity: 1,
  forwardMinutes: 0,
  forwardSeconds: 0,
  bilibiliMinimalMode: false, // B站极简模式开关
  youTubeMinimalMode: false // YouTube极简模式开关
})

watch(() => store.fullScreen, (newVal) => {
  if (newVal === 'viewer') {
    // 全屏視聽方時，自動置頂動漫方
    store.forcedTop = 'anime'
  } else if (newVal === 'anime') {
    // 全屏動漫方時，自動置頂視聽方
    store.forcedTop = 'viewer'
  }
})

// 监听 B 站极简模式变化
watch(() => store.bilibiliMinimalMode, (newVal) => {
  if (store.viewer.type === 'bilibili') {
    store.viewer.setMinimalMode(newVal)
  }
  if (store.anime.type === 'bilibili') {
    store.anime.setMinimalMode(newVal)
  }
})

// 监听 YouTube 极简模式变化
watch(() => store.youTubeMinimalMode, (newVal) => {
  if (store.viewer.type === 'youtube') {
    store.viewer.setMinimalMode(newVal)
  }
  if (store.anime.type === 'youtube') {
    store.anime.setMinimalMode(newVal)
  }
})

// 监听播放器类型变化，如果是 B 站则应用当前极简模式设置
watch(() => store.viewer.type, (newType, oldType) => {
  if (newType === 'bilibili') {
    // 延迟应用极简模式，确保播放器已完全初始化
    setTimeout(() => {
      if (store.viewer.setMinimalMode) {
        store.viewer.setMinimalMode(store.bilibiliMinimalMode)
      }
    }, 0)
  } else if (newType === 'youtube') {
    // 延迟应用极简模式，确保播放器已完全初始化
    setTimeout(() => {
      if (store.viewer.setMinimalMode) {
        store.viewer.setMinimalMode(store.youTubeMinimalMode)
      }
    }, 0)
  }
})

watch(() => store.anime.type, (newType, oldType) => {
  if (newType === 'bilibili') {
    // 延迟应用极简模式，确保播放器已完全初始化
    setTimeout(() => {
      if (store.anime.setMinimalMode) {
        store.anime.setMinimalMode(store.bilibiliMinimalMode)
      }
    }, 0)
  } else if (newType === 'youtube') {
    // 延迟应用极简模式，确保播放器已完全初始化
    setTimeout(() => {
      if (store.anime.setMinimalMode) {
        store.anime.setMinimalMode(store.youTubeMinimalMode)
      }
    }, 0)
  }
})
