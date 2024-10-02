import pino from 'pino';
import { env } from './env';
import { join } from 'path';
import fastify from 'fastify';
//import cors from '@fastify/cors';
import { dayjs } from './core/libs/dayjs';
import fastifyStatic from '@fastify/static';
import { errorHandler } from './core/libs/error_handler';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';

// Imports of routes
import { computing } from './core/routes/upload';
import { confirm } from './core/routes/confirm';
import { measures } from './core/routes/measures';

const api = fastify({
  logger: pino({
    enabled: true,
    base: null,
    transport: {
      target: 'pino-pretty',
      options: {
        destination: './core/logs/shopper.log',
        colorize: true,
        translateTime: `🕰 dd-mm-yyyy HH:MM:ss TT Z`,
        ignore: 'pid,hostname',
      },
    },
    name: '[API SHOPPER]',
    serializers: {
      res(res) {
        // The default
        return {
          statusCode: res.statusCode
        }
      },
      req(req) {
        return {
          method: req.method,
          url: req.url,
          path: req.path,
          parameters: req.parameters,
          headers: req.headers
        };
      }
    }
  })
});//.withTypeProvider<ZodTypeProvider>();

/*api.register(cors, {
  //origin: [`${env.API_BASE_URL}:${env.PORT}`, `/\localhost\:${env.PORT}$/`]
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  credentials: true,
});*/

// Configurando o fastify-static para servir imagens da pasta 'uploads'
api.register(fastifyStatic, {
  root: join(__dirname, '/uploads'),
  prefix: '/images/',
});

api.setValidatorCompiler(validatorCompiler);
api.setSerializerCompiler(serializerCompiler);

// Register my routes
api.get('/', async () => {
  return 'Olá dev.'
});

// registered routes
api.register(confirm);
api.register(measures);
api.register(computing);

// Handler for capture errors
api.setErrorHandler(errorHandler);

api.listen({ port: env.PORT }).then(() => {
  api.log.info(`[API SHOPPER] - API SHOPPER iniciada!`);
  console.log(`[API SHOPPER ${dayjs(new Date())}] - API SHOPPER iniciada!`);
});