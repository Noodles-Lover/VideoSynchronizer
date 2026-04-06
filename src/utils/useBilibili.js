import { ref } from 'vue'

export function useBilibili() {
  // 解析 B 站视频 BV 号
  const getBilibiliId = (url) => {
    try {
      // 先尝试提取 URL 部分（处理包含中文的完整分享文本）
      const urlMatch = url.match(/(https?:\/\/[^\s]+)/);
      const actualUrl = urlMatch ? urlMatch[1] : url;
      
      const u = new URL((actualUrl || '').trim())
      
      if (u.hostname.includes('bilibili.com')) {
        // 匹配 /video/BVxxxxx/ 格式
        if (u.pathname.includes('/video/')) {
          const match = u.pathname.match(/\/video\/(BV[a-zA-Z0-9]+)/)
          if (match) {
            return match[1]
          }
        }
        // 匹配短链接格式 /BVxxxxx
        const shortMatch = u.pathname.match(/^\/(BV[a-zA-Z0-9]+)/)
        if (shortMatch) {
          return shortMatch[1]
        }
      }
      // 尝试从 URL 原始字符串中直接提取 BV 号（用于处理非标准 URL 的分享文本）
      const directMatch = (actualUrl || '').match(/BV[a-zA-Z0-9]{10}/);
      if (directMatch) {
        return directMatch[0];
      }
      return ''
    } catch (e) {
      // 如果 URL 解析失败，尝试直接从原始字符串中提取 BV 号
      const directMatch = (actualUrl || '').match(/BV[a-zA-Z0-9]{10}/);
      if (directMatch) {
        return directMatch[0];
      }
      return ''
    }
  }

  // 提取 B 站时间戳（秒）
  const getBilibiliTimestamp = (url) => {
    if (!url) return 0
    try {
      // 先尝试提取 URL 部分（处理包含中文的完整分享文本）
      const urlMatch = url.match(/(https?:\/\/[^\s]+)/);
      const actualUrl = urlMatch ? urlMatch[1] : url;
      
      const u = new URL((actualUrl || '').trim())
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
   * 移除 URL 中的时间戳参数（t）
   */
  const stripBilibiliTimestamp = (url) => {
    if (!url) return ''
    try {
      // 先尝试提取 URL 部分（处理包含中文的完整分享文本）
      const urlMatch = url.match(/(https?:\/\/[^\s]+)/);
      const actualUrl = urlMatch ? urlMatch[1] : url;
      
      const u = new URL((actualUrl || '').trim())
      u.searchParams.delete('t')
      const cleanedUrl = u.toString()
      
      // 如果是完整分享文本，保留原始文本部分，只替换 URL
      if (urlMatch && url !== actualUrl) {
        return url.replace(actualUrl, cleanedUrl)
      }
      return cleanedUrl
    } catch (e) {
      return url
    }
  }

  // 构建 B 站嵌入 URL
  const buildBilibiliEmbed = (url, startTime = 0, autoplay = false, isMinimal = false) => {
    const bvid = getBilibiliId(url)
    if (!bvid) return ''
    
    // 从 URL 中提取分集参数 p
    const urlMatch = url.match(/(https?:\/\/[^\s]+)/);
    const actualUrl = urlMatch ? urlMatch[1] : url;
    const u = new URL((actualUrl || '').trim())
    const p = u.searchParams.get('p') || '1' // 使用 URL 中的 p 参数，没有则默认第1集
    
    const baseUrl = isMinimal ? 'bilibili.com/blackboard/html5mobileplayer.html' : 'player.bilibili.com/player.html'
    const params = new URLSearchParams()
    params.append('bvid', bvid)
    params.append('p', p) // 使用提取的分集参数
    
    // 添加时间戳参数，使用 0.001 替代 0
    if (startTime > 0) {
      params.append('t', startTime.toString())
    } else {
      params.append('t', '0.001') // 使用 0.001 确保从头开始播放
    }
    
    // 添加高质量参数
    params.append('high_quality', '1')
    
    // 极简模式参数
    if (isMinimal) {
      params.append('hideCoverInfo', '1')
      params.append('autoplay', '1') // 极简模式强制自动播放
    }
    
    if (autoplay && !isMinimal) params.append('autoplay', '1')
    
    const embedUrl = `//${baseUrl}?${params.toString()}`
    return embedUrl
  }

  // 判断是否为 B 站链接
  const isBilibili = (url) => /bilibili\.com/.test((url || '').trim())

  // 提取 B 站分集参数
  const getBilibiliEpisodeInfo = (url) => {
    try {
      const urlMatch = url.match(/(https?:\/\/[^\s]+)/);
      const actualUrl = urlMatch ? urlMatch[1] : url;
      const u = new URL((actualUrl || '').trim())
      const p = u.searchParams.get('p')
      return { p: p ? parseInt(p) : null }
    } catch (e) {
      return { p: null }
    }
  }

  // 构建下一集的 B 站 URL
  const getNextBilibiliUrl = (url) => {
    try {
      const urlMatch = url.match(/(https?:\/\/[^\s]+)/);
      const actualUrl = urlMatch ? urlMatch[1] : url;
      const u = new URL((actualUrl || '').trim())
      const p = u.searchParams.get('p')
      const newP = p ? parseInt(p) + 1 : 2
      u.searchParams.set('p', newP.toString())
      return u.toString()
    } catch (e) {
      return url
    }
  }

  return {
    getBilibiliId,
    getBilibiliTimestamp,
    stripBilibiliTimestamp,
    buildBilibiliEmbed,
    isBilibili,
    getBilibiliEpisodeInfo,
    getNextBilibiliUrl
  }
}
