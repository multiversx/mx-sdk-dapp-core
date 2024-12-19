export interface IEventBus<T> {
  publish(event: string, data: T): void;
}
