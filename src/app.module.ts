import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AuthModule } from './auth/auth.module';
import { RestarantModule } from './restaurants/restaurants.module';
import { Restaurant } from './restaurants/entities/restaurants.entity';
import { Category } from './restaurants/entities/category.entity';
import { UserModule } from './users/users.module';
import { User } from './users/entities/users.entity';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';

/* GraphQL in NextJS: https://docs.nestjs.com/graphql/quick-start */
/* GraphQL Playground: http://localhost:3000/graphql */
import { GraphQLModule } from '@nestjs/graphql';

/* TypeORM: https://docs.nestjs.com/techniques/database */
import { TypeOrmModule } from '@nestjs/typeorm';

/* ConfigModule: https://docs.nestjs.com/techniques/configuration */
import { ConfigModule } from '@nestjs/config';

/* Data Validation: https://www.npmjs.com/package/joi */
import * as Joi from 'joi';

/* Decorator (e.g. @Module): (1) Connects 'Classes' and 'Metadata' (2) Enables NestJS to Create a Routing Map */
/* @Module: https://docs.nestjs.com/modules#modules */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod', 'test').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN_NAME: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required()
      })
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: process.env.NODE_ENV !== 'prod', /* Must be False in Production (Causes Production Data Loss) */
      logging: process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'test',
      entities: [Restaurant, Category, User, Verification]
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      context: ({ req }) => ({ user: req['user'] })
    }),
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY
    }),
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY, /* Private Key */
      domain: process.env.MAILGUN_DOMAIN_NAME, /* sandbox***.mailgun.org */
      fromEmail: process.env.MAILGUN_FROM_EMAIL /* me@samples.mailgun.org */
    }),
    AuthModule,
    UserModule,
    RestarantModule
  ],
  controllers: [],
  providers: []
})
/* Middleware: https://docs.nestjs.com/middleware#middleware */
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({ path: '/graphql', method: RequestMethod.POST })
  }
}
