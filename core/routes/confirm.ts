/*
Responsável por confirmar ou corrigir o valor lido pelo LLM,
Esse endpoint deve:
• Validar o tipo de dados dos parâmetros enviados
• Verificar se o código de leitura informado existe
• Verificar se o código de leitura já foi confirmado
• Salvar no banco de dados o novo valor informado
Ele NÃO deve fazer:
• Fazer novas consultas ao LLM para validar o novo resultado recebido
Ela irá retornar:
• Resposta de OK ou ERRO dependendo do valor informado
*/

import { z } from "zod";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

// import my libs
import { prisma } from '../libs/prisma';

async function confirm(api: FastifyInstance) {
  api.withTypeProvider<ZodTypeProvider>().patch('/confirm',
    {
      schema: {
        body: z.object({
          measure_uuid: z.string().uuid(),
          confirmed_value: z.number(),
        })
      }
    },
    async (request, reply) => {
      const { measure_uuid, confirmed_value } = request.body;

      // getting specific meter
      const measures_saved = await prisma.meter.findUnique({
        where: {
          measure_uuid: measure_uuid,
        },
        select: {
          measure_uuid: true,
          measure_value: true,
          has_confirmed: true,
        },
      });

      // check the two possible error cases
      if (!measures_saved) {
        return reply.code(404).send({
          "error_code": "MEASURE_NOT_FOUND",
          "error_description": "Leitura do mês já realizada"
        });
      } else if (measures_saved.has_confirmed) {
        return reply.code(409).send({
          "error_code": "CONFIRMATION_DUPLICATE",
          "error_description": "Leitura do mês já realizada"
        })
      }

      // In case the measure has not been confirmed, confirmation will be recorded
      await prisma.meter.update({
        where: { measure_uuid: measure_uuid },
        data: {
          measure_value: confirmed_value,
          has_confirmed: true
        }
      });

      return reply.code(200).send({
        "success": true
      });
    }
  );
};

export { confirm };