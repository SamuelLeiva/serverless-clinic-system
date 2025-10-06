import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { ISnsService } from "../../app/ports/snsService";
import { AppointmentRequest } from "../../types/appointment";

const TOPIC_ARN = process.env.APPOINTMENT_TOPIC_ARN;
const snsClient = new SNSClient({});

export class SnsService implements ISnsService {
    async publishAppointmentRequest(data: AppointmentRequest, appointmentId: string): Promise<void> {
        if (!TOPIC_ARN) {
            console.error('APPOINTMENT_TOPIC_ARN no está definido.');
            throw new Error('Configuración de SNS incompleta.');
        }

        const payload = {
            ...data,
            id: appointmentId
        }

        const command = new PublishCommand({
            TopicArn: TOPIC_ARN,
            Message: JSON.stringify(payload),
            MessageAttributes: {
                countryISO: {
                    DataType: 'String',
                    StringValue: data.countryISO,
                },
            },
        });

        await snsClient.send(command);
    }
}