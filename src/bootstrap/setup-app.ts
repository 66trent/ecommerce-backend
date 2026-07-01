import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { APP_CONFIG } from 'src/config/app/app.config';

export function setupApp(
  app: NestExpressApplication,
  logger: Logger,
  config: ConfigService,
) {
  app.use(cookieParser());

  //CORS
  const appCfg = config.getOrThrow<{ corsOrigin: string[] }>(APP_CONFIG);
  const allowList = appCfg.corsOrigin;
  app.enableCors({
    origin: (requestOrigin: string, callback) => {
      if (!requestOrigin) {
        callback(null, true);
        return;
      }

      if (allowList.includes(requestOrigin)) {
        callback(null, true);
        return;
      }

      logger.warn(
        `CORS: blocked request from origin "${requestOrigin}" (not in allowList)`,
      );

      callback(null, false);
    },

    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
    credentials: true,
  });

  //ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      //chuyen request thanh instant cua DTO
      transform: true,
      //Tu doan kieu du lieu va tu chuyen ve dung kieu trong DTO
      transformOptions: { enableImplicitConversion: true },
      //Loai bo truong thuong trong DTO
      whitelist: true,
      //Tra loi 400 neu co truong thua`
      forbidNonWhitelisted: true,
    }),
  );

  //API versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.enableShutdownHooks();
}
