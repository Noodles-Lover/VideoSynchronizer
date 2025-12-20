import { reactive, watch } from 'vue'

export const store = reactive({
  viewerRawUrl: '',
  viewerStartTime: 0,
  viewerEmbedUrl: '',
  animeRawUrl: '',
  animeStartTime: 0,
  animeEmbedUrl: '',
  viewerColor: '#3498db', // 蓝色
  animeColor: '#e74c3c',  // 红色
  forcedTop: 'none',
  fullScreen: 'none',
  settingsPosition: 'right', // 'left' or 'right'
  settingsOpacity: 0.85
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




