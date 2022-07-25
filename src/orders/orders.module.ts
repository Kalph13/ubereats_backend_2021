import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { Restaurant } from "src/restaurants/entities/restaurants.entity";
import { Dish } from "src/restaurants/entities/dish.entity";
import { OrderResolver } from "./order.resolver";
import { OrderService } from "./order.service";

@Module({
    imports: [TypeOrmModule.forFeature([Order, OrderItem, Restaurant, Dish])],
    providers: [OrderResolver, OrderService]
})
export class OrderModule {}
