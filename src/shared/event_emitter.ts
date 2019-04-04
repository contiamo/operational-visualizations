type EventData = any;

class EventEmitter {
  private subscribers: Record<string, Array<(e: EventData) => void>> = {};

  public on(eventName: string, callback: (e: EventData) => void) {
    this.subscribers[eventName] = this.subscribers[eventName] || [];
    this.subscribers[eventName].push(callback);
  }

  public removeListener(eventName: string, callback: (e: EventData) => void) {
    if (!this.subscribers[eventName]) {
      return;
    }
    this.subscribers[eventName] = this.subscribers[eventName].filter(cb => cb !== callback);
  }

  public removeAllListeners(eventName: string) {
    this.subscribers[eventName] = [];
  }

  public emit(eventName: string, eventData: EventData = {}) {
    if (!this.subscribers[eventName]) {
      return;
    }
    this.subscribers[eventName].forEach(subscriber => {
      subscriber(eventData);
    });
  }

  public removeAll() {
    this.subscribers = {};
  }
}

export default EventEmitter;
