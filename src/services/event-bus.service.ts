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

type DataEventCallback<T> = (data: T) => void;

class DataEventBus<T> {
  private listeners: DataEventCallback<T>[] = [];

  public subscribe(callback: DataEventCallback<T>): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public emit(data: T): void {
    this.listeners.forEach((cb) => {
      cb(data);
    });
  }
}

export const syncPendingBus = new DataEventBus<boolean>();
