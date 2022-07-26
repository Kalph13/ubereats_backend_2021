import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Order } from "./entities/order.entity";
import { OrderService } from "./order.service";
import { Role } from "src/auth/role.decorator";
import { AuthUser } from "src/auth/auth-user.decorator";
import { User } from "src/users/entities/users.entity";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";

@Resolver(of => Order)
export class OrderResolver {
    constructor (
        private readonly orderService: OrderService
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
