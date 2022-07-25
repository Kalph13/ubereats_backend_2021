import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/users.entity";
import { Repository } from "typeorm";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { Restaurant } from "src/restaurants/entities/restaurants.entity";
import { Dish } from "src/restaurants/entities/dish.entity";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orders: Repository<Order>,
        @InjectRepository(OrderItem)
        private readonly orderitems: Repository<OrderItem>,
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>,
        @InjectRepository(Dish)
        private readonly dishes: Repository<Dish>
    ) {}

    async createOrder(customer: User, { restaurantId, items }: CreateOrderInput): Promise<CreateOrderOutput> {
        try {
            const restaurant = await this.restaurants.findOne({
                where: {
                    id: restaurantId
                }
            });

            if (!restaurant) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: "The restaurant is not found"
                }
            }

            let orderPrice = 0;
            const orderItems: OrderItem[] = [];

            /* forEach is Not Working */
            for (const item of items) {
                const dish = await this.dishes.findOne({
                    where: {
                        id: item.dishId
                    }
                });

                if (!dish) {
                    return {
                        GraphQLSucceed: false,
                        GraphQLError: "Couldn't find the dish"
                    }
                }

                let dishPrice = dish.price;

                /* forEach is Not Working */
                for (const itemOption of item.options) {
                    const dishOption = dish.options.find(
                        dishOption => dishOption.name === itemOption.name
                    );

                    if (dishOption) {
                        if (dishOption.extra) {
                            dishPrice = dishPrice + dishOption.extra;
                        } else {
                            const dishOptionChoice = dishOption.choices.find(
                                dishOptionChoice => dishOptionChoice.name === itemOption.choice
                            );

                            if (dishOptionChoice) {
                                if (dishOptionChoice.extra) {
                                    dishPrice = dishPrice + dishOptionChoice.extra;
                                }
                            }
                        }
                    }
                };

                orderPrice = orderPrice + dishPrice;

                const orderItem = await this.orderitems.save(this.orderitems.create({
                    dish,
                    options: item.options
                }));

                orderItems.push(orderItem);
            };

            await this.orders.save(this.orders.create({
                customer,
                restaurant,
                total: orderPrice,
                items: orderItems
            }));

            return {
                GraphQLSucceed: true
            }
        } catch {
            return {
                GraphQLSucceed: false,
                GraphQLError: "Couldn't create the order"
            }
        }
    }
}
