/*
Responsável por receber uma imagem em base 64, consultar o Gemini e retornar a
medida lida pela API
Esse endpoint deve:
• Validar o tipo de dados dos parâmetros enviados (inclusive o base64)
• Verificar se já existe uma leitura no mês naquele tipo de leitura.
• Integrar com uma API de LLM para extrair o valor da imagem
Ela irá retornar:
• Um link temporário para a imagem
• Um GUID
• O valor numérico reconhecido pela LLM


Request Body
{
 "image": "base64",
 "customer_code": "string",
 "measure_datetime": "datetime",
 "measure_type": "WATER" ou "GAS"
}
*/
import { z } from "zod";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

// Imports my libs
import { env } from '../../env';
import { dayjs } from '../libs/dayjs';
import { model } from '../libs/gemini';
import { prisma } from '../libs/prisma';
import { upload } from '../libs/upload';

type Measure = {
  measure_uuid: string;
  measure_month: number;
}

async function computing(api: FastifyInstance) {
  api.withTypeProvider<ZodTypeProvider>().post('/upload',
    {
      schema: {
        body: z.object({
          image: z.string().base64(),
          customer_code: z.string(),
          measure_datetime: z.string().datetime(),
          measure_type: z.enum(['GAS', 'WATER']),
        })
      }
    },
    async (request, reply) => {
      // get data on request
      const { image, customer_code, measure_datetime, measure_type } = request.body;

      // check if the measurement date already exists
      const month_datetime = dayjs(measure_datetime).month() + 1;

      // get data of customer_code
      const measures_saved = await prisma.meter.findMany({
        where: {
          customer_code: customer_code,
          measure_type: measure_type,
        },
        select: {
          measure_uuid: true,
          measure_month: true,
        },
      });

      let saved: Measure | undefined = undefined;
      // filtering item by month
      if (measures_saved) {
        saved = measures_saved.find(measure => measure.measure_month === month_datetime);
      }
      // check for existing measure in database
      if ((month_datetime == saved?.measure_month) || saved) {
        return reply.code(409).send({
          "error_code": "DOUBLE_REPORT",
          "error_description": "Leitura do mês já realizada"
        });
      }
      // create prompt to extract value in the image
      let prompt: string;
      if (measure_type === "WATER") {
        prompt = `Take the role of an agent of a ${measure_type} company, and identify the numerical value in the meter image. The meter has between 6 and 8 digits with large numbers. The meter The answer must be a numeric value only, no enter punctuations or full stops after the number.`;
      } else {
        prompt = `Take the role of an agent of a ${measure_type} company, and identify the numerical value in the meter image. The meter has between 7 and 8 digits with large numbers. The meter The answer must be a numeric value only, no enter punctuations or full stops after the number.`;
      }

      //upload to temporary file
      const image_saved = await upload(image, measure_type, measure_datetime);

      // call Gemini to process image
      const meter = {
        inlineData: {
          data: image,
          mimeType: image_saved['typeFile']
        }
      };
      // Using Gemini to detect numbers in the image
      const result = await model.generateContent([prompt, meter]);
      // converting string to Integer
      const value = parseInt(result.response.text().replace(/(\r\n|\n|\r|\s+)/gm, ""));
      // setting url for local image
      const image_url = `${env.API_BASE_URL}:${env.PORT}/images/${image_saved['fileName']}`;

      // save in database
      const measure = await prisma.meter.create({
        data: {
          customer_code: customer_code,
          measure_datetime: measure_datetime,
          measure_value: value,
          measure_month: month_datetime,
          measure_type: measure_type,
          has_confirmed: false,
          image_url: image_url
        }
      });

      return reply.code(200).send({
        image_url: `${env.API_BASE_URL}:${env.PORT}/images/${image_saved['fileName']}`,
        measure_value: value,
        measure_uuid: measure.measure_uuid,
      });
    }
  );
}

export { computing }