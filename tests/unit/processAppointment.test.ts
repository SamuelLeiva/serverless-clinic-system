import { ProcessAppointmentUseCase } from '../../src/app/use-cases/processAppointmentUseCase';
import { ICountryRepository } from '../../src/app/ports/countryRepository';
import { IEventBridgeService } from '../../src/app/ports/eventBridgeService';
import { AppointmentWithId } from '../../src/types/appointment';

describe('ProcessAppointmentUseCase', () => {
    let mockCountryRepo: jest.Mocked<ICountryRepository>;
    let mockEventBridge: jest.Mocked<IEventBridgeService>;
    let useCase: ProcessAppointmentUseCase;
    
    const appointmentData: AppointmentWithId = { 
        id: 'completed-123', 
        insuredId: '99999', 
        scheduleId: 200, 
        countryISO: 'CL',
        status: "pending",
        createdAt: new Date().toDateString()
    };

    beforeEach(() => {
        mockCountryRepo = { 
            registerAppointment: jest.fn() 
        } as jest.Mocked<ICountryRepository>;
        
        mockEventBridge = { 
            sendCompletionEvent: jest.fn() 
        } as jest.Mocked<IEventBridgeService>;
        
        useCase = new ProcessAppointmentUseCase(mockCountryRepo, mockEventBridge);
    });

    it('debería registrar la cita en la DB del país y enviar el evento de conformidad', async () => {
        await useCase.execute(appointmentData);

        // Verificar que se llamó al repositorio del país con todos los datos
        expect(mockCountryRepo.registerAppointment).toHaveBeenCalledWith(appointmentData);
        
        // Verificar que se envió el evento de conformidad a EventBridge, usando el ID
        expect(mockEventBridge.sendCompletionEvent).toHaveBeenCalledWith(appointmentData.id);
        
        // Verificar el orden y la cantidad de llamadas
        expect(mockCountryRepo.registerAppointment).toHaveBeenCalledTimes(1);
        expect(mockEventBridge.sendCompletionEvent).toHaveBeenCalledTimes(1);
    });
});