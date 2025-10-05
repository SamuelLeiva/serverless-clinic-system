import { AppointmentWithId } from "../../types/appointment";

export interface ICountryRepository {
    registerAppointment(data: AppointmentWithId): Promise<void>
}