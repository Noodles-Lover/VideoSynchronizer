import { reactive, watch } from 'vue'

export const store = reactive({
  viewerUrl: '',
  viewerStartTime: 0,
  animeUrl: '',
  animeStartTime: 0,
  viewerColor: '#3498db', // 蓝色
  animeColor: '#e74c3c'  // 红色
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


