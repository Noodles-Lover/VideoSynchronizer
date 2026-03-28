import { VideoPlayer } from './BaseVideoPlayer.js';

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
      const playSafely = () => {
        const p = videoElement.play();
        if (p && typeof p.then === 'function') {
          p.catch(() => {});
        }
      };
      const onSeeked = () => {
        videoElement.removeEventListener('seeked', onSeeked);
        if (videoElement.readyState >= 3) {
          playSafely();
        } else {
          const onCanPlay = () => {
            videoElement.removeEventListener('canplay', onCanPlay);
            playSafely();
          };
          videoElement.addEventListener('canplay', onCanPlay, { once: true });
          setTimeout(() => {
            videoElement.removeEventListener('canplay', onCanPlay);
            playSafely();
          }, 500);
        }
      };
      if (videoElement.src !== this.embedUrl) {
        videoElement.src = this.embedUrl;
        videoElement.load();
        videoElement.addEventListener('loadedmetadata', () => {
          videoElement.currentTime = targetTime;
          videoElement.addEventListener('seeked', onSeeked, { once: true });
        }, { once: true });
      } else {
        if (videoElement.readyState < 1) {
          videoElement.load();
          videoElement.addEventListener('loadedmetadata', () => {
            videoElement.currentTime = targetTime;
            videoElement.addEventListener('seeked', onSeeked, { once: true });
          }, { once: true });
        } else {
          videoElement.currentTime = targetTime;
          videoElement.addEventListener('seeked', onSeeked, { once: true });
        }
      }
    }
  }
}
