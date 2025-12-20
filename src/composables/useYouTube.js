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
      return ''
    } catch (e) {
      return ''
    }
  }

  // 新增：構建 YouTube embed URL（恢復第一版顯示邏輯）
  const buildYouTubeEmbed = (url) => {
    const id = getYouTubeId(url)
    if (!id) return ''
    const params = new URLSearchParams({ controls: '1', modestbranding: '1', rel: '0', playsinline: '1' })
    return `https://www.youtube.com/embed/${id}?${params.toString()}`
  }

  // 简易判断是否为 YouTube（域名匹配）
  const isYouTube = (url) => /youtube\.com|youtu\.be/.test((url || '').trim())

  return {
    getYouTubeId,
    buildYouTubeEmbed,
    isYouTube,
  }
}