import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Restaurant } from "./entities/restaurants.entity";
import { Category } from "./entities/category.entity";
import { Dish } from "./entities/dish.entity";
import { RestaurantResolver, CategoryResolver, DishResolver } from "./restaurants.resolver";
import { RestaurantService } from "./restaurants.service";

/* @Module: https://docs.nestjs.com/modules */
@Module({
    imports: [TypeOrmModule.forFeature([Restaurant, Category, Dish])],
    providers: [RestaurantResolver, CategoryResolver, DishResolver, RestaurantService]
})
export class RestarantModule {}
