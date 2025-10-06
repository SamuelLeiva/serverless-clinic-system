import { RegisterAppointmentUseCase } from '../../src/app/use-cases/registerAppointmentUseCase';
import { IAppointmentRepository } from '../../src/app/ports/appointmentRepository';
import { ISnsService } from '../../src/app/ports/snsService';
import { IIdGenerator } from '../../src/app/ports/idGenerator';
import { AppointmentRequest } from '../../src/types/appointment';

describe('RegisterAppointmentUseCase', () => {
    // 1. Declaración de Mocks
    let mockRepo: jest.Mocked<IAppointmentRepository>;
    let mockSns: jest.Mocked<ISnsService>;
    let mockIdGenerator: jest.Mocked<IIdGenerator>;
    let useCase: RegisterAppointmentUseCase;

    const MOCK_ID = 'mock-uuid-12345';
    const requestData: AppointmentRequest = { 
        insuredId: '00123', 
        scheduleId: 100, 
        countryISO: 'PE' 
    };

    beforeEach(() => {
        // Inicializar mocks con las funciones simuladas
        mockRepo = { 
            save: jest.fn(), 
            findByInsuredId: jest.fn(),
            updateStatus: jest.fn()
        } as jest.Mocked<IAppointmentRepository>;
        
        mockSns = { 
            publishAppointmentRequest: jest.fn() 
        } as jest.Mocked<ISnsService>;
        
        // Simular que el generador siempre devuelve el mismo ID
        mockIdGenerator = { 
            generate: jest.fn().mockReturnValue(MOCK_ID) 
        } as jest.Mocked<IIdGenerator>;

        useCase = new RegisterAppointmentUseCase(
            mockRepo,
            mockSns,
            mockIdGenerator
        );
    });

    it('debería generar un ID, guardar como pending y publicar a SNS con el ID', async () => {
        await useCase.execute(requestData);

        // Verificar que el ID se generó
        expect(mockIdGenerator.generate).toHaveBeenCalledTimes(1);

        // Verificar que se llamó a save con el ID y estado 'pending'
        expect(mockRepo.save).toHaveBeenCalledWith(requestData, MOCK_ID, 'pending');

        // Verificar que se llamó a publish con los datos y el ID (CRÍTICO para el flujo async)
        expect(mockSns.publishAppointmentRequest).toHaveBeenCalledWith(requestData, MOCK_ID);
        
        // Asegurar que las llamadas son únicas
        expect(mockRepo.save).toHaveBeenCalledTimes(1);
        expect(mockSns.publishAppointmentRequest).toHaveBeenCalledTimes(1);
    });
});