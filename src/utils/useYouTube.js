import { ref } from 'vue'

export function useYouTube() {
  // 解析 YouTube 视频 ID（支持 watch?v=、youtu.be、/shorts/、/embed/）
  const getYouTubeId = (url) => {
    try {
      const u = new URL((url || '').trim())
      if (u.hostname.includes('youtu.be')) {
        return u.pathname.replace('/', '')
      }
      const v = u.searchParams.get('v')
      if (v) return v
      if (u.pathname.startsWith('/shorts/')) {
        return u.pathname.split('/shorts/')[1]?.split('/')[0] || ''
      }
      if (u.pathname.startsWith('/embed/')) {
        return u.pathname.split('/embed/')[1]?.split('/')[0] || ''
      }
      if (u.pathname.startsWith('/live/')) {
        return u.pathname.split('/live/')[1]?.split('/')[0] || ''
      }
      return ''
    } catch (e) {
      return ''
    }
  }

  // 提取 YouTube 时间戳（秒）
  const getYouTubeTimestamp = (url) => {
    if (!url) return 0
    try {
      const u = new URL(url.includes('://') ? url : 'https://' + url)
      const t = u.searchParams.get('t')
      if (t) {
        // 处理 3750s 或 3750 格式
        return parseInt(t.toString().replace('s', '')) || 0
      }
      return 0
    } catch (e) {
      return 0
    }
  }

  /**
   * 移除 URL 中的時間戳參數（t, start）
   */
  const stripYouTubeTimestamp = (url) => {
    if (!url) return ''
    try {
      const u = new URL(url.includes('://') ? url : `https://${url}`)
      u.searchParams.delete('t')
      u.searchParams.delete('start')
      // 如果是 youtu.be/xxx?t=123 這種格式，URL 對象會把 t 放在 searchParams
      return u.toString()
    } catch (e) {
      return url
    }
  }

  // 新增：构建 YouTube embed URL（恢复第一版显示逻辑）
  /**
   * 构建 YouTube 嵌入 URL
   */
  const buildYouTubeEmbed = (url, startTime = 0, autoplay = false) => {
    const id = getYouTubeId(url)
    if (!id) return ''
    
    const params = new URLSearchParams()
    if (startTime > 0) params.append('start', startTime)
    if (autoplay) params.append('autoplay', '1')
    
    return `https://www.youtube.com/embed/${id}?${params.toString()}`
  }

  // 简易判断是否为 YouTube（域名匹配）
  const isYouTube = (url) => /youtube\.com|youtu\.be/.test((url || '').trim())

  return {
    getYouTubeId,
    getYouTubeTimestamp,
    stripYouTubeTimestamp,
    buildYouTubeEmbed,
    isYouTube
  }
}
