import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { IAppointmentRepository } from "../../app/ports/appointmentRepository";
import { Appointment, AppointmentRequest } from "../../types/appointment";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.APPOINTMENTS_TABLE_NAME;
const GSI_NAME = process.env.INSURED_ID_GSI_NAME;  //vendra de una env variable

if (!TABLE_NAME || !GSI_NAME) {
    throw new Error('Configuración de DynamoDB incompleta: TABLE_NAME o GSI_NAME no definidos.');
}

export class DynamoDBRepository implements IAppointmentRepository {
  async findByInsuredId(insuredId: string): Promise<Appointment[]> {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: GSI_NAME,
      KeyConditionExpression: "insuredId = :i", // La condición de búsqueda
      ExpressionAttributeValues: {
        ":i": insuredId,
      },
    });

    const response = await ddbDocClient.send(command);
    return (response.Items as Appointment[]) || []
  }

  async save(
    request: AppointmentRequest,
    id: string,
    status: "pending"
  ): Promise<void> {
    const item: Appointment = {
      id,
      insuredId: request.insuredId,
      scheduleId: request.scheduleId,
      countryISO: request.countryISO,
      status,
      createdAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    });

    await ddbDocClient.send(command);
  }
}
