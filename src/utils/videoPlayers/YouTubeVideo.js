import { VideoPlayer } from './BaseVideoPlayer.js';
import { useYouTube } from '@/utils/useYouTube';

const { buildYouTubeEmbed, getYouTubeTimestamp, stripYouTubeTimestamp } = useYouTube();

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
