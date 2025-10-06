export interface IEventBridgeService {
    sendCompletionEvent(appointmentId: string): Promise<void>;
}