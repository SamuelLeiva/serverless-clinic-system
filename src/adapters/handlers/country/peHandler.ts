import { SQSHandler } from "aws-lambda";
import { ProcessAppointmentUseCase } from "../../../app/use-cases/processAppointmentUseCase";
import { EventBridgeService } from "../../aws/eventBridgeService";
import { MySqlRepository } from "../../database/MySqlRepository";
import { AppointmentWithId } from "../../../types/appointment";

// Config de la DB de Perú
const PE_DB_CONFIG = {
  host: process.env.MYSQL_PE_HOST || "localhost-pe-sim",
  database: "pe_appointments_db",
};

// Dependencias a usar
const peRepository = new MySqlRepository(PE_DB_CONFIG);
const eventBridgeService = new EventBridgeService();
const processAppointmentUseCase = new ProcessAppointmentUseCase(
  peRepository,
  eventBridgeService
);

export const handler: SQSHandler = async (event) => {
  for (const record of event.Records) {
    try {
      // SQS recibe el mensaje de SNS. El cuerpo contiene el JSON de SNS.
      const snsMessage = JSON.parse(record.body);
      // El mensaje de SNS con ID
      const appointmentData: AppointmentWithId = JSON.parse(snsMessage.Message);

      // 1. Ejecución del Caso de Uso
      await processAppointmentUseCase.execute(appointmentData);
      console.log(
        `[PE] Cita ${appointmentData.id} procesada y conformidad enviada.`
      );
    } catch (error) {
      console.error(
        `Error procesando mensaje SQS para PE. El mensaje será reintentado: ${error}`
      );
      // Lanzar el error hace que SQS reintente el mensaje (durabilidad)
      throw error;
    }
  }
};
