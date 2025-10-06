import { AppointmentWithId } from "../../types/appointment";
import { ICountryRepository } from "../ports/countryRepository";
import { IEventBridgeService } from "../ports/eventBridgeService";

export class ProcessAppointmentUseCase {
    constructor(
        private countryRepository: ICountryRepository,
        private eventBridgeService: IEventBridgeService
    ) {}

    async execute(request: AppointmentWithId): Promise<void> {
        
        // Registrar en la base de datos MySQL
        await this.countryRepository.registerAppointment(request);

        // Notificación de Conformidad
        await this.eventBridgeService.sendCompletionEvent(request.id);
    }
}