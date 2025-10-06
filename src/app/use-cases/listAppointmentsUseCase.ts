import { Appointment } from '../../types/appointment';
import { IAppointmentRepository } from '../ports/appointmentRepository';

export class ListAppointmentsUseCase {
    constructor(private appointmentRepository: IAppointmentRepository) {}

    async execute(insuredId: string): Promise<Appointment[]> {
        // En un caso real: validaciones, etc.
        if (insuredId.length !== 5) {
             throw new Error('Formato de insuredId es incorrecto.');
        }

        return this.appointmentRepository.findByInsuredId(insuredId);
    }
}