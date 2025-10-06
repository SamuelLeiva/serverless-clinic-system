import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { IEventBridgeService } from "../../app/ports/eventBridgeService";

const EVENT_BRIDGE_SOURCE = process.env.EVENT_BRIDGE_SOURCE; // 'appointment.service'
const ebClient = new EventBridgeClient({});

export class EventBridgeService implements IEventBridgeService {
    async sendCompletionEvent(appointmentId: string): Promise<void> {
        if (!EVENT_BRIDGE_SOURCE) {
             throw new Error("EVENT_BRIDGE_SOURCE no definido.");
        }
        
        const command = new PutEventsCommand({
            Entries: [
                {
                    Source: EVENT_BRIDGE_SOURCE,
                    DetailType: 'AppointmentCompleted', // La Regla de EventBridge escucha este tipo
                    Detail: JSON.stringify({ appointmentId }), // Carga útil mínima
                    EventBusName: 'default',
                },
            ],
        });

        await ebClient.send(command);
    }
}