import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { ISnsService } from "../../app/ports/snsService";
import { AppointmentRequest } from "../../types/appointment";

// Nota: Quitamos la inicialización global aquí y la movemos al constructor/método
export class SnsService implements ISnsService {
    private snsClient: SNSClient;
    private topicArn: string;

    constructor() {
        this.topicArn = process.env.APPOINTMENT_TOPIC_ARN || '';
        if (!this.topicArn) {
            // Este error debería ser atrapado en el handler si es lanzado.
            console.error('ERROR DE CONFIGURACIÓN: APPOINTMENT_TOPIC_ARN no está definido.');
        }
        // Inicializar el cliente SNS
        this.snsClient = new SNSClient({}); 
    }

    async publishAppointmentRequest(data: AppointmentRequest, appointmentId: string): Promise<void> {
        if (!this.topicArn) {
            throw new Error('Configuración de SNS incompleta: Topic ARN missing.');
        }

        const payload = {
            ...data,
            id: appointmentId
        };
        
        // Log de lo que se va a publicar (útil para la depuración)
        console.log(`[SNS] Publicando agendamiento ${appointmentId} para ${data.countryISO}.`);

        const command = new PublishCommand({
            TopicArn: this.topicArn, // Usamos la propiedad de la clase
            Message: JSON.stringify(payload),
            MessageAttributes: {
                countryISO: {
                    DataType: 'String',
                    StringValue: data.countryISO,
                },
            },
        });

        try {
            const result = await this.snsClient.send(command);
            // AGREGAR ESTE LOG CRÍTICO
            console.log(`[SNS] Publicación exitosa. MessageId: ${result.MessageId}`);
        } catch (error) {
            // PROPAGAR EL ERROR para que el handler principal lo atrape y devuelva 500.
            console.error(`[SNS] ERROR al publicar la solicitud ${appointmentId}:`, error);
            throw new Error(`Fallo en el servicio de SNS para cita ${appointmentId}.`);
        }
    }
}
