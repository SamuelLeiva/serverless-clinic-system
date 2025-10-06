import { IAppointmentRepository } from "../ports/appointmentRepository";

export class CompleteAppointmentUseCase {
    constructor(private appointmentRepository: IAppointmentRepository) {}

    async execute(appointmentId: string): Promise<void> {
        // Actualizar el estado
        await this.appointmentRepository.updateStatus(appointmentId, 'completed');
    }
}