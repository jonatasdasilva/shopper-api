/*
Responsável por listar as medidas realizadas por um determinado cliente
Esse endpoint deve:
• Receber o código do cliente e filtrar as medidas realizadas por ele
• Ele opcionalmente pode receber um query parameter “measure_type”, que
deve ser “WATER” ou “GAS”
▪ A validação deve ser CASE INSENSITIVE
▪ Se o parâmetro for informado, filtrar apenas os valores do tipo
especificado. Senão, retornar todos os tipos.
Ex. {base url}/<customer code>/list?measure_type=WATER
Ela irá retornar:
• Uma lista com todas as leituras realizadas.
*/

import { z, ZodError } from "zod";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

// import my libs
import { prisma } from '../libs/prisma';
import { ClientError } from "../libs/error";

const measureSchema = z.object({
  measure_uuid: z.string().uuid(),
  measure_datetime: z.string().datetime(),
  measure_type: z.string(),
  has_confirmed: z.boolean().nullable(),
  image_url: z.string().url()
});

type Measure = z.infer<typeof measureSchema>;

/*type Measure = {
  measure_uuid: string,
  measure_datetime: string,
  measure_type: string,
  has_confirmed: boolean | null,
  image_url: string
}*/

async function measures(api: FastifyInstance) {
  api.withTypeProvider<ZodTypeProvider>().get('/:customer_code/list',
    {
      schema: {
        params: z.object({
          customer_code: z.string()
        }),
        querystring: z.object({
          measure_type: z.enum(['GAS', 'WATER']).optional()
        })
      }
    },
    async (request, reply) => {
      const { measure_type } = request.query;
      const { customer_code } = request.params;

      // variable with medications, if they exist
      let measures: Measure[] = [];

      if (measure_type) {
        // get data of customer_code
        measures = await prisma.meter.findMany({
          where: {
            customer_code: customer_code,
            measure_type: measure_type,
          },
          select: {
            measure_uuid: true,
            measure_datetime: true,
            measure_type: true,
            has_confirmed: true,
            image_url: true
          },
        });
      } else {
        measures = await prisma.meter.findMany({
          where: {
            customer_code: customer_code,
          },
          select: {
            measure_uuid: true,
            measure_datetime: true,
            measure_type: true,
            has_confirmed: true,
            image_url: true
          },
        });
      }

      if (measures.length === 0) {
        return reply.status(404).send({
          "error_code": "MEASURES_NOT_FOUND",
          "error_description": "Nenhuma leitura encontrada"
        });
      }

      return reply.status(200).send({
        "customer_code": customer_code,
        "measures": measures
      });
    }
  );
};

export { measures }