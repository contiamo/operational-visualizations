declare class EventEmitter<EventData = any> {
    private subscribers;
    on(eventName: string, callback: (e: EventData) => void): void;
    removeListener(eventName: string, callback: (e: EventData) => void): void;
    removeAllListeners(eventName: string): void;
    emit(eventName: string, eventData?: EventData): void;
    removeAll(): void;
}
export default EventEmitter;
//# sourceMappingURL=event_emitter.d.ts.map