import { reactive } from 'vue';
const bus = reactive(new Map());

export const eventBus = {
  emit(event, ...args) {
    if (bus.has(event)) {
      bus.get(event).forEach(callback => callback(...args));
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
