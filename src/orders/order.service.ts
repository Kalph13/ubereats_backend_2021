import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User, UserRole } from "src/users/entities/users.entity";
import { Repository } from "typeorm";
import { Order, OrderStatus } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { Restaurant } from "src/restaurants/entities/restaurants.entity";
import { Dish } from "src/restaurants/entities/dish.entity";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto";
import { TakeOrderInput, TakeOrderOutput } from "./dtos/take-order.dto";

/* PubSub: https://docs.nestjs.com/graphql/subscriptions#pubsub */
import { PubSub } from "graphql-subscriptions"
import { PUB_SUB, NEW_PENDING_ORDER, NEW_COOKED_ORDER, NEW_ORDER_UPDATE } from "src/common/common.constants";

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
        private readonly dishes: Repository<Dish>,
        @Inject(PUB_SUB)
        private readonly pubSub: PubSub
    ) {}

    canSeeOrder(user: User, order: Order): boolean {
        let canSeeOrder = true;

        if (user.role === UserRole.Client && order.customerId !== user.id) {
            canSeeOrder = false;
        }

        if (user.role === UserRole.Delivery && order.driverId !== user.id) {
            canSeeOrder = false;
        }

        if (user.role === UserRole.Owner && order.restaurant.ownerId !== user.id) {
            canSeeOrder = false;
        }

        return canSeeOrder;
    };

    async getOrder(user: User, { id: orderId }: GetOrderInput): Promise<GetOrderOutput> {
        try {
            const order = await this.orders.findOne({
                where: {
                    id: orderId
                },
                relations: {
                    restaurant: true,
                    customer: true,
                    driver: true
                }
            });

            if (!order) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: "The order is not found"
                }
            }

            if (!this.canSeeOrder(user, order)) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: "You're not authorized"
                }
            }

            return {
                GraphQLSucceed: true,
                order
            }
        } catch {
            return {
                GraphQLSucceed: false,
                GraphQLError: "Couldn't find the order"
            }
        }
    };

    async getOrders(user: User, { status }: GetOrdersInput): Promise<GetOrdersOutput> {
        try {
            let orders: Order[];

            if (user.role === UserRole.Client) {
                orders = await this.orders.find({
                    where: {
                        customer: {
                            id: user.id
                        },
                        ...(status && { status })
                    }
                });
            } else if (user.role === UserRole.Delivery) {
                orders = await this.orders.find({
                    where: {
                        driver: {
                            id: user.id
                        },
                        ...(status && { status })
                    }
                });
            } else if (user.role === UserRole.Owner) {                
                orders = await this.orders.find({
                    where: {
                        restaurant: {
                            owner: {
                                id: user.id
                            }
                        },
                        ...(status && { status })
                    }
                });

                /* const restaurants = await this.restaurants.find({
                    where: {
                        owner {
                            id: user.id
                        }
                    },
                    relations: {
                        orders: true
                    }
                }); 
                
                orders = restaurants.map(restaurant => restaurant.orders).flat(1);
                
                if (status) {
                    orders = orders.filter(order => order.status === status);
                } */
            }

            return {
                GraphQLSucceed: true,
                orders
            };
        } catch {
            return {
                GraphQLSucceed: false,
                GraphQLError: "Couldn't find orders"
            };
        }
    };

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
                            const dishOptionChoice = dishOption.choices?.find(
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

            const order = await this.orders.save(this.orders.create({
                customer,
                restaurant,
                total: orderPrice,
                items: orderItems
            }));

            await this.pubSub.publish(NEW_PENDING_ORDER, {
                pendingOrders: {
                    order,
                    ownerId: restaurant.ownerId    
                }
            });

            return {
                GraphQLSucceed: true,
                orderId: order.id
            };
        } catch {
            return {
                GraphQLSucceed: false,
                GraphQLError: "Couldn't create the order"
            };
        }
    };

    async editOrder(user: User, { id: orderId, status }: EditOrderInput): Promise<EditOrderOutput> {
        try {
            const order = await this.orders.findOne({
                where: {
                    id: orderId
                },
                relations: {
                    restaurant: true
                }
            });

            if (!order) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: "Couldn't find the order"
                };
            }

            if (!this.canSeeOrder(user, order)) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: "You're not authorized"
                };
            }

            let canEditOrder = true;

            /* Client Can't Change Status */
            if (user.role === UserRole.Client) {
                canEditOrder = false;
            } 

            /* Owner Can Change Status Only into 'Cooking' or 'Cooked' */
            if (user.role === UserRole.Owner) {
                if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) {
                    canEditOrder = false;
                }
            }

            /* Driver Can Change Status Only into 'PickedUp' or 'Delivered' */
            if (user.role === UserRole.Delivery) {
                if (status !== OrderStatus.PickedUp && status !== OrderStatus.Delivered) {
                    canEditOrder = false;
                }
            }

            if (!canEditOrder) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: "You can't edit the order"
                };
            }

            await this.orders.save({
                id: orderId,
                status
            });

            const newOrder = { ...order, status };
            console.log("------ Edit Order ------ newOrder:", newOrder);

            if (user.role === UserRole.Owner) {
                console.log("------ Edit Order ------ user.role:", user.role);
                if (status === OrderStatus.Cooked) {
                    console.log("------ Edit Order ------ status:", status);
                    await this.pubSub.publish(NEW_COOKED_ORDER, {
                        cookedOrder: newOrder
                    });
                }
            }

            await this.pubSub.publish(NEW_ORDER_UPDATE, {
                orderUpdate: newOrder,
            });

            return {
                GraphQLSucceed: true
            };
        } catch {
            return {
                GraphQLSucceed: false,
                GraphQLError: "Couldn't edit the order"
            };
        }
    }

    async takeOrder ( driver: User, { id: orderId }: TakeOrderInput ): Promise<TakeOrderOutput> {
        try {
            const order = await this.orders.findOne({
                where: {
                    id: orderId
                }
            });

            if (!order) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: "Couldn't find the order"
                }
            }

            if (order.driver) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: "The order is already taken by another driver"
                }
            }

            await this.orders.save({
                id: order.id,
                driver
            });

            await this.pubSub.publish(NEW_ORDER_UPDATE, {
                orderUpdate: { ...order, driver }
            });

            return {
                GraphQLSucceed: true
            };
        } catch {
            return {
                GraphQLSucceed: false,
                GraphQLError: "Couldn't take the order"
            }
        }
    }
}
