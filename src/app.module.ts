import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { RestarantsModule } from './restaurants/restaurants.module';

/* Decorator (e.g. @Module): (1) Connects 'Classes' and 'Metadata' (2) Enables NestJS to Create a Routing Map */

/* GraphQL in NextJS: https://docs.nestjs.com/graphql/quick-start */
/* GraphQL Playground: http://localhost:3000/graphql */
@Module({
  imports: [
    RestarantsModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true
    }),
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
