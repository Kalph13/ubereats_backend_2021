import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/users.module';
import { RestarantModule } from './restaurants/restaurants.module';
import { OrderModule } from './orders/orders.module';
import { MailModule } from './mail/mail.module';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { User } from './users/entities/users.entity';
import { Verification } from './users/entities/verification.entity';
import { Restaurant } from './restaurants/entities/restaurants.entity';
import { Category } from './restaurants/entities/category.entity';
import { Dish } from './restaurants/entities/dish.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';

/* GraphQL in NextJS: https://docs.nestjs.com/graphql/quick-start */
/* GraphQL Playground: http://localhost:3000/graphql */
import { GraphQLModule } from '@nestjs/graphql';

/* TypeORM: https://docs.nestjs.com/techniques/database */
import { TypeOrmModule } from '@nestjs/typeorm';

/* ConfigModule: https://docs.nestjs.com/techniques/configuration */
import { ConfigModule } from '@nestjs/config';

/* Data Validation: https://www.npmjs.com/package/joi */
import * as Joi from 'joi';

/* Authentication over WebSockets: https://docs.nestjs.com/graphql/subscriptions#authentication-over-websockets */
import { Context } from 'apollo-server-core';

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
      /* logging: process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'test', */
      entities: [User, Verification, Restaurant, Category, Dish, Order, OrderItem]
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      /* Authentication over WebSockets: https://docs.nestjs.com/graphql/subscriptions#authentication-over-websockets */
      /* Using 'subscriptions-transport-ws': Will be Deprecated */
      /* installSubscriptionHandlers: true,
      subscriptions: {
        'subscriptions-transport-ws': {
          path: "/graphql",
          onConnect: connectionParams => {
            console.log("------ AppModule ------ connectionParams:", connectionParams);
            return connectionParams;
          }
        }
      }, */
      /* Using 'graphql-ws': Recommended */
      subscriptions: {
        'graphql-ws': {
          path: "/graphql",
          onConnect: (context: Context<any>) => {
            const { connectionParams, extra } = context
            console.log("------ AppModule Subscription------ context.connectionParams:", connectionParams);
            extra.params = context.connectionParams;
          }
        }
      },
      context: ({ req, extra }) => {
        const LOGINTOKEN_KEY = "x-jwt";
        if (req) {
          console.log("------ AppModule ------ req.headers['x-jwt']:", req.headers[LOGINTOKEN_KEY]);
          return {
            loggedInUser: req['loggedInUser'],
            loginToken: req.headers[LOGINTOKEN_KEY]
          };
        } else {
          console.log("------ AppModule ------ extra.params['x-jwt']:", extra.params[LOGINTOKEN_KEY]);
          return {
            loginToken: extra.params[LOGINTOKEN_KEY]
          }
        }
      }
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
    RestarantModule,
    OrderModule
  ],
  controllers: [],
  providers: []
})
/* Middleware: https://docs.nestjs.com/middleware#middleware */
/* Moved to AuthGuard to Use Subscription */
/* export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({ path: '/graphql', method: RequestMethod.POST })
  }
} */
export class AppModule {}
