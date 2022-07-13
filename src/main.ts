import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/* Class Validator: https://docs.nestjs.com/pipes#class-validator */
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  /* Global Scoped Pipes: https://docs.nestjs.com/pipes#global-scoped-pipes */
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}

bootstrap();
