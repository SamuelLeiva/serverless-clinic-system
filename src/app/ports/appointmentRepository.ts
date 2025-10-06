import { Appointment, AppointmentRequest } from "../../types/appointment";

export interface IAppointmentRepository {
    save(request: AppointmentRequest, id: string, status: 'pending'): Promise<void>;
    findByInsuredId(insuredId: string): Promise<Appointment[]>;
    updateStatus(id: string, newStatus: "completed"): Promise<void>;
}