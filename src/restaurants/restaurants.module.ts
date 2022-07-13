import { Module } from "@nestjs/common";
import { RestaurantsResolver } from "./restaurants.resolver";

/* @Module: https://docs.nestjs.com/modules */
@Module({
    providers: [RestaurantsResolver]
})
export class RestarantsModule {}
