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
  animeOpacity: 1
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
