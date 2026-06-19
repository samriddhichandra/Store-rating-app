import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { Request, Response } from 'express';

const createNestServer = async (): Promise<NestExpressApplication> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new (require('@nestjs/common').ValidationPipe)({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.setGlobalPrefix('api');
  await app.init();
  return app;
};

export default async (req: Request, res: Response) => {
  const app = await createNestServer();
  return app.getHttpAdapter().getInstance()(req, res);
};
