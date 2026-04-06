import { VideoPlayer } from './BaseVideoPlayer.js';
import { useBilibili } from '@/utils/useBilibili';

const { buildBilibiliEmbed, getBilibiliTimestamp, stripBilibiliTimestamp } = useBilibili();

export class BilibiliVideo extends VideoPlayer {
  constructor() {
    super();
    this.type = 'bilibili';
    this.isMinimal = false; // 极简模式开关
  }

  setMinimalMode(isMinimal) {
    this.isMinimal = isMinimal;
    this.updateEmbedUrl(); // 切换模式时更新嵌入 URL
  }

  load(url, preserveStartTime = false) {
    const timestamp = preserveStartTime ? this.startTime : getBilibiliTimestamp(url);
    const cleanUrl = stripBilibiliTimestamp(url);
    
    // URL 发生变化时更新
    if (this.rawUrl !== cleanUrl) {
      this.rawUrl = cleanUrl;
      this.startTime = timestamp;
      this.updateEmbedUrl();
    } else if (this.startTime !== timestamp && !preserveStartTime) {
      // URL 相同但时间戳不同，只更新 startTime
      this.startTime = timestamp;
      this.updateEmbedUrl();
    }
    
    this.displayText = this.rawUrl;
  }

  updateEmbedUrl() {
    const newEmbedUrl = buildBilibiliEmbed(this.rawUrl, this.startTime, false, this.isMinimal);
    this.embedUrl = newEmbedUrl;
  }

  play(videoElement) {
    // 播放时才构造嵌入链接，确保使用最新的 startTime 和极简模式设置
    if (!this.rawUrl) return;
    
    const playUrl = buildBilibiliEmbed(this.rawUrl, this.startTime, true, this.isMinimal);
    if (!playUrl) return;
    
    try {
      const u = new URL('https:' + playUrl); // B站使用协议相对URL，需要补全
      u.searchParams.set('sync', Date.now());
      this.embedUrl = u.toString().replace('https:', ''); // 移除协议，保持协议相对
    } catch (e) {
      console.error('Invalid Bilibili URL:', this.embedUrl);
    }
  }

  seekAndPlay(videoElement, offsetSeconds) {
    // 播放时才构造嵌入链接，确保使用最新的时间
    if (!this.rawUrl) return;
    
    const totalStartTime = (this.startTime || 0) + offsetSeconds;
    const playUrl = buildBilibiliEmbed(this.rawUrl, totalStartTime, true, this.isMinimal);
    if (!playUrl) return;
    
    try {
      const u = new URL('https:' + playUrl); // B站使用协议相对URL，需要补全
      u.searchParams.set('sync', Date.now());
      this.embedUrl = u.toString().replace('https:', ''); // 移除协议，保持协议相对
    } catch (e) {
      console.error('Invalid Bilibili URL in seekAndPlay:', this.embedUrl);
    }
  }
}
