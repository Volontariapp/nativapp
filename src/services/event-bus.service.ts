type EventCallback = () => void;

class EventBus {
  private listeners: EventCallback[] = [];

  public subscribe(callback: EventCallback): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public emit(): void {
    this.listeners.forEach((cb) => {
      cb();
    });
  }
}

export const authExpiredBus = new EventBus();
