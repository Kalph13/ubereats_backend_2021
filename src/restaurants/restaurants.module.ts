import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Category } from "./entities/category.entity";
import { Restaurant } from "./entities/restaurants.entity";
import { CategoryResolver, RestaurantResolver } from "./restaurants.resolver";
import { RestaurantService } from "./restaurants.service";

/* @Module: https://docs.nestjs.com/modules */
@Module({
    imports: [TypeOrmModule.forFeature([Restaurant, Category])],
    providers: [RestaurantResolver, CategoryResolver, RestaurantService]
})
export class RestarantModule {}
