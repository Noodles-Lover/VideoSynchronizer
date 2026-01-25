import { reactive } from 'vue';
const bus = reactive(new Map());

export const eventBus = {
  emit(event, ...args) {
    if (bus.has(event)) {
      // 修改：使用 try-catch 包裹回調，防止單個回調報錯導致後續回調不執行
      bus.get(event).forEach(callback => {
        try {
          callback(...args);
        } catch (e) {
          console.error(`Error in eventBus handler for "${event}":`, e);
        }
      });
    }
  },
  on(event, callback) {
    if (!bus.has(event)) {
      bus.set(event, []);
    }
    bus.get(event).push(callback);
  },
  off(event, callback) {
    if (bus.has(event)) {
      const callbacks = bus.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
};
