import { AppointmentRequest } from '../../types/appointment';
import { IAppointmentRepository } from '../ports/appointmentRepository';
import { ISnsService } from '../ports/snsService';
import { v4 as uuidv4 } from 'uuid'; 

export class RegisterAppointmentUseCase {
    constructor(
        private appointmentRepository: IAppointmentRepository,
        private snsService: ISnsService
    ) {}

    async execute(request: AppointmentRequest): Promise<void> {
        const appointmentId = uuidv4();

        // Registrar Petición en DynamoDB
        await this.appointmentRepository.save(request, appointmentId, 'pending');

        // Publicar en SNS para el procesamiento asíncrono por país
        await this.snsService.publishAppointmentRequest(request);
    }
}
