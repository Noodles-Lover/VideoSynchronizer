import { VideoPlayer } from './BaseVideoPlayer.js';
import { useYouTube } from '@/utils/useYouTube';

const { buildYouTubeEmbed, getYouTubeTimestamp, stripYouTubeTimestamp } = useYouTube();

export class YouTubeVideo extends VideoPlayer {
  constructor() {
    super();
    this.type = 'youtube';
    this.isMinimal = false; // 极简模式开关
  }

  setMinimalMode(isMinimal) {
    this.isMinimal = isMinimal;
    this.updateEmbedUrl(); // 切换模式时更新嵌入 URL
  }

  load(url) {
    const timestamp = getYouTubeTimestamp(url);
    const cleanUrl = stripYouTubeTimestamp(url);
    
    // URL 发生变化时更新
    if (this.rawUrl !== cleanUrl) {
      this.rawUrl = cleanUrl;
      this.startTime = timestamp;
      this.updateEmbedUrl();
    } else if (timestamp > 0) {
      // URL 相同但有新的时间戳
      this.startTime = timestamp;
      this.updateEmbedUrl();
    }
    
    this.displayText = this.rawUrl;
  }

  updateEmbedUrl() {
    this.embedUrl = buildYouTubeEmbed(this.rawUrl, this.startTime, false, this.isMinimal);
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
    this.embedUrl = buildYouTubeEmbed(this.rawUrl, totalStartTime, false, this.isMinimal);
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

  nextVideo() {
    // 使用 YouTube API 的 nextVideo() 方法切换到下一集
    // 这需要通过 iframe API 调用，这里返回一个标志表示需要切换
    this.updateEmbedUrl();
  }
}
