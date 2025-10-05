import { AppointmentRequest } from "../../types/appointment";

export interface ISnsService {
  publishAppointmentRequest(data: AppointmentRequest, appointmentId: string): Promise<void>;
}
