import { Inject } from "@nestjs/common";
import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { Order } from "./entities/order.entity";
import { OrderService } from "./order.service";
import { Role } from "src/auth/role.decorator";
import { AuthUser } from "src/auth/auth-user.decorator";
import { User } from "src/users/entities/users.entity";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto";
import { OrderUpdateInput } from "./dtos/order-update.dto";
import { TakeOrderInput, TakeOrderOutput } from "./dtos/take-order.dto";

/* PubSub: https://docs.nestjs.com/graphql/subscriptions#pubsub */
import { PubSub } from "graphql-subscriptions"
import { PUB_SUB, NEW_PENDING_ORDER, NEW_COOKED_ORDER, NEW_ORDER_UPDATE } from "src/common/common.constants";

@Resolver(of => Order)
export class OrderResolver {
    constructor (
        private readonly orderService: OrderService,
        @Inject(PUB_SUB)
        private readonly pubSub: PubSub
    ) {}

    @Query(returns => GetOrderOutput)
    @Role(["Any"])
    async getOrder(
        @AuthUser() user: User,
        @Args("input") getOrderInput: GetOrderInput
    ): Promise<GetOrderOutput> {
        return this.orderService.getOrder(user, getOrderInput);
    }

    @Query(returns => GetOrdersOutput)
    @Role(["Any"])
    async getOrders(
        @AuthUser() user: User,
        @Args("input") getOrdersInput: GetOrdersInput
    ): Promise<GetOrdersOutput> {
        return this.orderService.getOrders(user, getOrdersInput);
    }

    @Mutation(returns => CreateOrderOutput)
    @Role(["Client"])
    async createOrder(
        @AuthUser() customer: User,
        @Args("input") createOrderInput: CreateOrderInput
    ): Promise<CreateOrderOutput> {
        return this.orderService.createOrder(customer, createOrderInput);
    }

    @Mutation(returns => EditOrderOutput)
    @Role(["Any"])
    async editOrder(
        @AuthUser() customer: User,
        @Args("input") editOrderInput: EditOrderInput
    ): Promise<EditOrderOutput> {
        return this.orderService.editOrder(customer, editOrderInput);
    }

    @Mutation(returns => TakeOrderOutput)
    @Role(["Delivery"])
    async takeOrder(
        @AuthUser() driver: User,
        @Args("input") takeOrderInput: TakeOrderInput
    ): Promise<TakeOrderOutput> {
        return this.orderService.takeOrder(driver, takeOrderInput);
    }

    @Subscription(returns => Order, {
        filter: (payload, variables, context) => {
            console.log("------ PendingOrders ------ return:", payload.pendingOrders.ownerId === context.loggedInUser.user.id);
            return payload.pendingOrders.ownerId === context.loggedInUser.user.id;
        },
        resolve: ({ pendingOrders: { order }}) => order
    })
    @Role(["Owner"])
    pendingOrders() {
        console.log("------ Pending Orders ------ Start");
        return this.pubSub.asyncIterator(NEW_PENDING_ORDER);
    }

    @Subscription(returns => Order)
    @Role(["Delivery"])
    cookedOrders() {
        console.log("------ Cooked Orders ------ Start");
        return this.pubSub.asyncIterator(NEW_COOKED_ORDER);
    }

    @Subscription(returns => Order, {
        filter: ( 
            { orderUpdate: order }: { orderUpdate: Order },
            { input }: { input: OrderUpdateInput },
            { loggedInUser: { user } }: { loggedInUser: { user: User } } /* Get 'loggedInUser' From the Context ('context' of GraphQLModule in 'app.module.ts') */
        ) => {
            if (
                order.driverId !== user.id &&
                order.customerId !== user.id &&
                order.restaurant.ownerId !== user.id
            ) {
                console.log("------ Subscription Filter ------ return: false (No ID Matches)");
                return false;
            }
            console.log("------ Subscription Filter ------ return:", order.id === input.id);
            return order.id === input.id;
        }
    })
    @Role(["Any"])
    orderUpdate(
        @Args("input") orderUpdateInput: OrderUpdateInput
    ) {
        console.log("------ Order Update ------ orderUpdateInput:", orderUpdateInput);
        return this.pubSub.asyncIterator(NEW_ORDER_UPDATE);
    }
}

/* 
------ Query GetOrder ------
query GetOrder {
    getOrder (input: {
        id: ***
    }) {
        GraphQLSucceed
        GraphQLError
        order {
            id
            createdAt
            updatedAt
            total
            status
        }
    }
}

------ Query GetOrders ------
query GetOrders {
    getOrders (input: {
        status: ***
    }) {
        GraphQLSucceed
        GraphQLError
        orders {
            id
            createdAt
            updatedAt
            total
        }
    }
}

------ Mutation CreateOrder ------
mutation CreateOrder {
    createOrder (input: {
        restaurantId: ***,
        items: {
            dishId: ***,
            options: {
                name: "***",
                choice: "***"
            }
        }
    }) {
        GraphQLSucceed,
        GraphQLError
    }
}
*/
