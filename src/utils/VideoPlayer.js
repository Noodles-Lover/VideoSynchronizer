import { useYouTube } from '@/utils/useYouTube';

const { buildYouTubeEmbed, isYouTube, getYouTubeTimestamp, stripYouTubeTimestamp } = useYouTube();

export class VideoPlayer {
  constructor() {
    this.displayText = '';
    this.rawUrl = '';
    this.embedUrl = '';
    this.startTime = 0;
    this.type = 'none'; // 'youtube', 'local', 'none'
  }

  // 修改：提供默認實現，避免拋出錯誤導致 eventBus 中斷
  load(source) {
    console.log('Base player load called with:', source);
  }

  // 修改：提供默认实现
  play(videoElement) {
    console.log('Base player play called');
  }

  // 新增：跳转并播放逻辑
  seekAndPlay(videoElement, offsetSeconds) {
    console.log('Base player seekAndPlay called with offset:', offsetSeconds);
  }
}

export class YouTubeVideo extends VideoPlayer {
  constructor() {
    super();
    this.type = 'youtube';
  }

  load(url) {
    const timestamp = getYouTubeTimestamp(url);
    const cleanUrl = stripYouTubeTimestamp(url);
    
    // 只有當 URL 發生變化，或者 URL 中包含新的時間戳時，才更新 startTime
    if (this.rawUrl !== cleanUrl || timestamp > 0) {
      this.rawUrl = cleanUrl;
      if (timestamp > 0) {
        this.startTime = timestamp;
      }
    }
    
    this.displayText = this.rawUrl;
    this.updateEmbedUrl();
  }

  updateEmbedUrl() {
    this.embedUrl = buildYouTubeEmbed(this.rawUrl, this.startTime, false);
  }

  play(videoElement) {
    // YouTube 通过修改 URL 触发播放，添加 sync 参数确保重载
    this.updateEmbedUrl(); // 播放前確保 embedUrl 是最新的
    if (!this.embedUrl) return;
    try {
      const u = new URL(this.embedUrl);
      u.searchParams.set('autoplay', '1');
      // 注意：play 時已經包含了最新的 startTime
      u.searchParams.set('sync', Date.now());
      this.embedUrl = u.toString();
    } catch (e) {
      console.error('Invalid YouTube URL:', this.embedUrl);
    }
  }

  seekAndPlay(videoElement, offsetSeconds) {
    const totalStartTime = (this.startTime || 0) + offsetSeconds;
    this.embedUrl = buildYouTubeEmbed(this.rawUrl, totalStartTime, false);
    if (!this.embedUrl) return;
    try {
      const u = new URL(this.embedUrl);
      u.searchParams.set('autoplay', '1');
      u.searchParams.set('sync', Date.now());
      this.embedUrl = u.toString();
    } catch (e) {
      console.error('Invalid YouTube URL in seekAndPlay:', this.embedUrl);
    }
  }
}

export class LocalVideo extends VideoPlayer {
  constructor() {
    super();
    this.type = 'local';
  }

  load(file) {
    if (file instanceof File) {
      this.rawUrl = `本地文件: ${file.name}`;
      this.displayText = this.rawUrl;
      this.embedUrl = URL.createObjectURL(file);
      this.startTime = 0;
    }
  }

  play(videoElement) {
    if (videoElement) {
      const startPlaying = () => {
        if (this.startTime > 0) {
          videoElement.currentTime = this.startTime;
        }
        videoElement.play().catch(e => console.warn('Local play failed:', e));
      };

      if (videoElement.src !== this.embedUrl) {
        videoElement.src = this.embedUrl;
        videoElement.load();
        videoElement.onloadedmetadata = () => {
          startPlaying();
          videoElement.onloadedmetadata = null;
        };
      } else {
        startPlaying();
      }
    }
  }

  seekAndPlay(videoElement, offsetSeconds) {
    if (videoElement) {
      const targetTime = (this.startTime || 0) + offsetSeconds;
      const startPlaying = () => {
        videoElement.currentTime = targetTime;
        videoElement.play().catch(e => console.warn('Local seekAndPlay failed:', e));
      };

      if (videoElement.src !== this.embedUrl) {
        videoElement.src = this.embedUrl;
        videoElement.load();
        videoElement.onloadedmetadata = () => {
          startPlaying();
          videoElement.onloadedmetadata = null;
        };
      } else {
        startPlaying();
      }
    }
  }
}

export class DirectLinkVideo extends VideoPlayer {
  constructor() {
    super();
    this.type = 'direct';
  }

  load(url) {
    this.rawUrl = url;
    this.displayText = url;
    this.embedUrl = url;
  }

  play(videoElement) {
    if (videoElement) {
      const startPlaying = () => {
        if (this.startTime > 0) {
          videoElement.currentTime = this.startTime;
        }
        videoElement.play().catch(e => console.warn('Direct link play failed:', e));
      };

      if (videoElement.src !== this.embedUrl) {
        videoElement.src = this.embedUrl;
        videoElement.load();
        // 如果切換了源，等待元數據加載後再跳轉時間並播放
        videoElement.onloadedmetadata = () => {
          startPlaying();
          videoElement.onloadedmetadata = null;
        };
      } else {
        startPlaying();
      }
    }
  }

  seekAndPlay(videoElement, offsetSeconds) {
    if (videoElement) {
      const targetTime = (this.startTime || 0) + offsetSeconds;
      const startPlaying = () => {
        videoElement.currentTime = targetTime;
        videoElement.play().catch(e => console.warn('Direct seekAndPlay failed:', e));
      };

      if (videoElement.src !== this.embedUrl) {
        videoElement.src = this.embedUrl;
        videoElement.load();
        videoElement.onloadedmetadata = () => {
          startPlaying();
          videoElement.onloadedmetadata = null;
        };
      } else {
        startPlaying();
      }
    }
  }
}

export function createPlayer(source) {
  if (!source) return new VideoPlayer();
  
  const sourceStr = String(source).trim();
  
  if (isYouTube(sourceStr)) {
    const p = new YouTubeVideo();
    p.load(sourceStr);
    return p;
  } else if (sourceStr.startsWith('http') || sourceStr.startsWith('/') || sourceStr.startsWith('./')) {
    const p = new DirectLinkVideo();
    p.load(sourceStr);
    return p;
  } else {
    const p = new LocalVideo();
    p.load(source);
    return p;
  }
}
