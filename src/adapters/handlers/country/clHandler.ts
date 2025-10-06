import { SQSHandler } from "aws-lambda";
import { ProcessAppointmentUseCase } from "../../../app/use-cases/processAppointmentUseCase";
import { AppointmentWithId } from "../../../types/appointment";
import { EventBridgeService } from "../../aws/eventBridgeService";
import { MySqlRepository } from "../../database/MySqlRepository";

const CL_DB_CONFIG = { 
    host: process.env.MYSQL_CL_HOST || 'localhost-cl-sim', 
    database: 'cl_appointments_db' 
};

const clRepository = new MySqlRepository(CL_DB_CONFIG);
const eventBridgeService = new EventBridgeService();
const processAppointmentUseCase = new ProcessAppointmentUseCase(clRepository, eventBridgeService);
// -----------------------------------------------------------

export const handler: SQSHandler = async (event) => {
    for (const record of event.Records) {
        try {
            const snsMessage = JSON.parse(record.body); 
            const appointmentData: AppointmentWithId = JSON.parse(snsMessage.Message);
            
            await processAppointmentUseCase.execute(appointmentData);
            console.log(`[CL] Cita ${appointmentData.id} procesada y conformidad enviada.`);

        } catch (error) {
            console.error(`Error procesando mensaje SQS para CL. El mensaje será reintentado: ${error}`);
            // Lanzar el error hace que SQS reintente el mensaje (durabilidad)
            throw error; 
        }
    }
};