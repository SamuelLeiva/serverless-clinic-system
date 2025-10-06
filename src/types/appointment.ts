// Payload de entrada de la aplicación web
export interface AppointmentRequest {
    insuredId: string; // código del asegurado de 5 dígitos
    scheduleId: number; // identificador o llave del espacio
    countryISO: 'PE' | 'CL';
}

// Estructura completa de la petición almacenada en DynamoDB
export interface Appointment {
    id: string; // UUID de la petición
    insuredId: string;
    scheduleId: number;
    countryISO: 'PE' | 'CL';
    status: 'pending' | 'completed';
    createdAt: string; 
    // Campos extra opcionales
    centerId?: number; 
    specialtyId?: number;
    medicId?: number;
    date?: string;
}

export interface AppointmentWithId extends Appointment{
    id: string;
}
