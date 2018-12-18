class EventEmitter {
  private subscribers: Record<string, any[]> = {};

  public on(eventName: string, callback: any) {
    this.subscribers[eventName] = this.subscribers[eventName] || [];
    this.subscribers[eventName].push(callback);
  }

  public removeListener(eventName: string, callback: any) {
    if (!this.subscribers[eventName]) {
      return;
    }
    this.subscribers[eventName] = this.subscribers[eventName].filter(cb => cb !== callback);
  }

  public removeAllListeners(eventName: string) {
    this.subscribers[eventName] = [];
  }

  public emit(eventName: string, eventData: any = {}) {
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
