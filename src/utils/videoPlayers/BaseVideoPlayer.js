export class VideoPlayer {
  constructor() {
    this.displayText = '';
    this.rawUrl = '';
    this.embedUrl = '';
    this.startTime = 0;
    this.type = 'none'; // 'youtube', 'bilibili', 'local', 'direct', 'none'
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
