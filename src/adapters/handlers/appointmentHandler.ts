import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { AppointmentRequest } from "../../types/appointment";
import { DynamoDBRepository } from "../database/DynamoDBRepository";
import { SnsService } from "../aws/snsService";
import { RegisterAppointmentUseCase } from "../../app/use-cases/registerAppointmentUseCase";
import { ListAppointmentsUseCase } from "../../app/use-cases/listAppointmentsUseCase";

// Zona global de inicialización
const appointmentRepository = new DynamoDBRepository();
const snsService = new SnsService();

const registerAppointmentUseCase = new RegisterAppointmentUseCase(
  appointmentRepository,
  snsService
);

const listAppointmentsUseCase = new ListAppointmentsUseCase(
  appointmentRepository
);

// Función de utilidad para validar la entrada
function validateRequest(body: any): AppointmentRequest {
  const { insuredId, scheduleId, countryISO } = body;

  if (!insuredId || typeof insuredId !== "string" || insuredId.length !== 5) {
    throw new Error("insuredId inválido (debe ser string de 5 dígitos).");
  }
  if (!scheduleId || typeof scheduleId !== "number" || scheduleId <= 0) {
    throw new Error("scheduleId inválido (debe ser un número positivo).");
  }
  if (countryISO !== "PE" && countryISO !== "CL") {
    throw new Error('countryISO inválido (debe ser "PE" o "CL").');
  }

  // El objeto validado cumple con la interfaz AppointmentRequest
  return { insuredId, scheduleId, countryISO } as AppointmentRequest;
}

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const method = event.requestContext.http.method; // Obtener el método HTTP y path
  const path = event.requestContext.http.path;

  try {
    // Ruta POST
    if (method === "POST" && path === "/appointment") {
      if (!event.body) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Cuerpo de la petición vacío." }),
        };
      }

      const body = JSON.parse(event.body);
      const requestData = validateRequest(body);

      await registerAppointmentUseCase.execute(requestData);

      return {
        statusCode: 202,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message:
            "Agendamiento en proceso. Consulta el estado usando el GET /appointment/{insuredId}.",
        }),
      };
    }

    //RUTA GET
    if (method === "GET" && path.startsWith("/appointment/")) {
      // El pathParameters contiene los valores de la ruta (/appointment/12345)
      const insuredId = event.pathParameters?.insuredId;

      if (!insuredId) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Debe especificar el insuredId en la ruta.",
          }),
        };
      }

      // Puedes reutilizar la validación básica del insuredId
      if (insuredId.length !== 5) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "insuredId inválido (debe ser string de 5 dígitos).",
          }),
        };
      }

      // Ejecución del Caso de Uso para Listar
      const appointments = await listAppointmentsUseCase.execute(insuredId);

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointments), // Retorna el arreglo de citas
      };
    }

    // Si no coincide con ninguna ruta/método esperado
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Ruta no encontrada." }),
    };
  } catch (error) {
    console.error("Error al procesar la petición:", error);

    if (
      error instanceof Error &&
      (error.message.includes("inválido") || error.message.includes("vacío"))
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: error.message }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error interno al iniciar el agendamiento.",
      }),
    };
  }
};
