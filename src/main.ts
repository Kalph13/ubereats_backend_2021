/* NestJS 101: https://wikidocs.net/book/7059 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/* Class Validator: https://docs.nestjs.com/pipes#class-validator */
import { ValidationPipe } from '@nestjs/common'

/* Middleware: https://docs.nestjs.com/middleware#middleware */
import { JwtMiddleware } from './jwt/jwt.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  /* Global Scoped Pipes: https://docs.nestjs.com/pipes#global-scoped-pipes */
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  /* app.use(JwtMiddleware); */
  await app.listen(process.env.PORT || 4000);
}

bootstrap();
