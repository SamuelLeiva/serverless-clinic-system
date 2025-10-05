import { AppointmentRequest } from "../../types/appointment";

export interface IAppointmentRepository {
    save(request: AppointmentRequest, id: string, status: 'pending'): Promise<void>;
}