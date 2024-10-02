import { ZodError } from "zod";
import { ClientError } from "./error";
import { FastifyInstance } from "fastify";

type fastifyErrorHandler = FastifyInstance['errorHandler'];

export const errorHandler: fastifyErrorHandler = (error, request, reply) => {
  const url = request.raw.url || '';
  // Handles specific case for type in /list
  if (url.includes('/list')) {
    if (error instanceof ZodError) {
      if (error.flatten().fieldErrors?.measure_type) {
        return reply.status(400).send({
          "error_code": "INVALID_TYPE",
          "error_description": "Tipo de medição não permitida"
        });
      }
    }
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      "error_code": "INVALID_DATA",
      "error_description": error.flatten().fieldErrors,
    });
  }

  if (error instanceof ClientError) {
    return reply.status(400).send({
      "error_code": "INVALID_DATA",
      "error_description": error,
    });
  }

  return reply.status(500).send({
    code: 500,
    error: error,
    message: 'Internal Error Server'
  });
}