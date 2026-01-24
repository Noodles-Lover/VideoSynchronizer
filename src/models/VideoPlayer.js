import { useYouTube } from '../composables/useYouTube';

const { buildYouTubeEmbed, isYouTube, getYouTubeTimestamp, stripYouTubeTimestamp } = useYouTube();

export class VideoPlayer {
  constructor() {
    this.displayText = '';
    this.rawUrl = '';
    this.embedUrl = '';
    this.startTime = 0;
    this.type = 'none'; // 'youtube', 'local', 'none'
  }

  load(source) {
    throw new Error('Method "load()" must be implemented.');
  }

  play(videoElement) {
    throw new Error('Method "play()" must be implemented.');
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
    } else if (typeof file === 'string') {
      // 处理直链
      this.rawUrl = file;
      this.displayText = file;
      this.embedUrl = file;
    }
  }

  play(videoElement) {
    if (videoElement) {
      if (this.startTime > 0) {
        videoElement.currentTime = this.startTime;
      }
      videoElement.play().catch(e => console.warn('Local play failed:', e));
    }
  }
}

export function createPlayer(source) {
  if (!source) return new VideoPlayer();
  if (isYouTube(source)) {
    const p = new YouTubeVideo();
    p.load(source);
    return p;
  } else {
    const p = new LocalVideo();
    p.load(source);
    return p;
  }
}
