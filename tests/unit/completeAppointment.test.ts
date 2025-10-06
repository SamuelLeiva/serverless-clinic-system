import { CompleteAppointmentUseCase } from '../../src/app/use-cases/completeAppointmentUseCase';
import { IAppointmentRepository } from '../../src/app/ports/appointmentRepository';

describe('CompleteAppointmentUseCase', () => {
    let mockRepo: jest.Mocked<IAppointmentRepository>;
    let useCase: CompleteAppointmentUseCase;
    
    const appointmentId = 'finished-id-456';

    beforeEach(() => {
        mockRepo = { 
            updateStatus: jest.fn(),
            save: jest.fn(),
            findByInsuredId: jest.fn()
        } as jest.Mocked<IAppointmentRepository>;
        
        useCase = new CompleteAppointmentUseCase(mockRepo);
    });

    it('debería llamar al repositorio para actualizar el estado a "completed"', async () => {
        await useCase.execute(appointmentId);

        // Verificar la llamada al método updateStatus
        expect(mockRepo.updateStatus).toHaveBeenCalledWith(appointmentId, 'completed');
        
        // Asegurar que solo se llamó a este método
        expect(mockRepo.updateStatus).toHaveBeenCalledTimes(1);
    });
});