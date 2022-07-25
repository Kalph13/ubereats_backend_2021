import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { Order } from "./entities/order.entity";
import { OrderService } from "./order.service";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { Role } from "src/auth/role.decorator";
import { AuthUser } from "src/auth/auth-user.decorator";
import { User } from "src/users/entities/users.entity";

@Resolver(of => Order)
export class OrderResolver {
    constructor (
        private readonly orderService: OrderService
    ) {}

    @Mutation(returns => CreateOrderOutput)
    @Role(["Client"])
    async createOrder(
        @AuthUser() customer: User,
        @Args("input") createOrderInput: CreateOrderInput
    ): Promise<CreateOrderOutput> {
        return this.orderService.createOrder(customer, createOrderInput);
    }
}
