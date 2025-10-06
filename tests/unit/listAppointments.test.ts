import { ListAppointmentsUseCase } from '../../src/app/use-cases/listAppointmentsUseCase';
import { IAppointmentRepository } from '../../src/app/ports/appointmentRepository';
import { Appointment } from '../../src/types/appointment';

describe('ListAppointmentsUseCase', () => {
    let mockRepo: jest.Mocked<IAppointmentRepository>;
    let useCase: ListAppointmentsUseCase;
    
    const mockAppointments: Appointment[] = [
        // Mock de datos de DynamoDB
        { id: 'a', insuredId: '00123', scheduleId: 1, countryISO: 'PE', status: 'pending', createdAt: 'date' },
    ];

    beforeEach(() => {
        mockRepo = { 
            findByInsuredId: jest.fn().mockResolvedValue(mockAppointments), 
            save: jest.fn(),
            updateStatus: jest.fn()
        } as jest.Mocked<IAppointmentRepository>;
        
        useCase = new ListAppointmentsUseCase(mockRepo);
    });

    it('debería llamar al repositorio para buscar citas por insuredId', async () => {
        const insuredId = '00123';
        
        const result = await useCase.execute(insuredId);

        // Verificar que se llama al método de búsqueda
        expect(mockRepo.findByInsuredId).toHaveBeenCalledWith(insuredId);
        
        // Verificar que el resultado es el esperado
        expect(result).toEqual(mockAppointments);
    });

    it('debería lanzar un error si insuredId no tiene 5 dígitos (validación de regla de negocio)', async () => {
        const invalidId = '1234'; // Solo 4 dígitos
        
        // Probar que la ejecución falla y contiene el mensaje de error esperado
        await expect(useCase.execute(invalidId)).rejects.toThrow('Formato de insuredId es incorrecto.');
        
        // Asegurar que NO se intentó consultar el repositorio
        expect(mockRepo.findByInsuredId).not.toHaveBeenCalled();
    });
});