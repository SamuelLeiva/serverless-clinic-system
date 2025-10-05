import { AppointmentRequest } from '../../types/appointment';
import { IAppointmentRepository } from '../ports/appointmentRepository';
import { IIdGenerator } from '../ports/idGenerator';
import { ISnsService } from '../ports/snsService';

export class RegisterAppointmentUseCase {
    constructor(
        private appointmentRepository: IAppointmentRepository,
        private snsService: ISnsService,
        private idGenerator: IIdGenerator
    ) {}

    async execute(request: AppointmentRequest): Promise<void> {
        const appointmentId = this.idGenerator.generate();

        // Registrar Petición en DynamoDB
        await this.appointmentRepository.save(request, appointmentId, 'pending');

        // Publicar en SNS para el procesamiento asíncrono por país
        await this.snsService.publishAppointmentRequest(request, appointmentId);
    }
}
