import { ICountryRepository } from "../../app/ports/countryRepository";
import { AppointmentWithId } from "../../types/appointment";

interface DbConfig {
    host: string;
    database: string;
}

export class MySqlRepository implements ICountryRepository{
    private dbConfig: DbConfig;

    constructor(dbConfig: DbConfig){
        this.dbConfig = dbConfig
    }

    async registerAppointment(data: AppointmentWithId): Promise<void> {
        // --- SIMULACIÓN DE REGISTRO EN DB RDS ---
        
        console.log(`[MYSQL-SIM] Cita ${data.id} para ${data.insuredId} registrada en la DB de ${data.countryISO}.`);
        console.log(`[MYSQL-SIM] Conexión a DB Host: ${this.dbConfig.host}`);

        // Simulación de latencia de 500ms
        await new Promise(resolve => setTimeout(resolve, 500)); 
    }
}