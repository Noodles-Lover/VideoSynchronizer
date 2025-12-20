import { reactive, watch } from 'vue'

export const store = reactive({
  viewerUrl: '',
  animeUrl: '',
  forcedTop: 'none', // 'none', 'viewer', 'anime'
  fullScreen: 'none', // 'none', 'viewer', 'anime'
})

// 當全屏狀態改變時，自動調整強制置頂
watch(() => store.fullScreen, (newVal) => {
  if (newVal === 'viewer') {
    // 全屏視聽方時，自動置頂動漫方
    store.forcedTop = 'anime'
  } else if (newVal === 'anime') {
    // 全屏動漫方時，自動置頂視聽方
    store.forcedTop = 'viewer'
  }
})
