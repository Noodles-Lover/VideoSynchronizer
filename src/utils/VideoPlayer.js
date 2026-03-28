import { useYouTube } from '@/utils/useYouTube';
import { useBilibili } from '@/utils/useBilibili';
import { VideoPlayer } from './videoPlayers/BaseVideoPlayer.js';
import { YouTubeVideo } from './videoPlayers/YouTubeVideo.js';
import { LocalVideo } from './videoPlayers/LocalVideo.js';
import { DirectLinkVideo } from './videoPlayers/DirectLinkVideo.js';
import { BilibiliVideo } from './videoPlayers/BilibiliVideo.js';

const { isYouTube } = useYouTube();
const { isBilibili } = useBilibili();

export function createPlayer(source) {
  if (!source) {
    return new VideoPlayer();
  }
  
  const sourceStr = String(source).trim();
  
  if (isYouTube(sourceStr)) {
    const p = new YouTubeVideo();
    p.load(sourceStr);
    return p;
  } else if (isBilibili(sourceStr)) {
    const p = new BilibiliVideo();
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

export { YouTubeVideo, LocalVideo, DirectLinkVideo, BilibiliVideo };
