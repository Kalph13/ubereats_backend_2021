import { Args, Query, Mutation, Resolver } from "@nestjs/graphql";
import { PaymentService } from "./payments.service";
import { Role } from "src/auth/role.decorator";
import { AuthUser } from "src/auth/auth-user.decorator";
import { User } from "src/users/entities/users.entity";
import { Payment } from "./entities/payment.entity";
import { CreatePaymentInput, CreatePaymentOutput } from "./dtos/create-payment.dto";
import { GetPaymentsOutput } from "./dtos/get-payments.dto";

@Resolver(of => Payment)
export class PaymentResolver {
    constructor(
        private readonly paymentService: PaymentService
    ) {}

    @Query(returns => GetPaymentsOutput)
    @Role(["Owner"])
    getPayments(
        @AuthUser() owner: User
    ): Promise<GetPaymentsOutput> {
        return this.paymentService.getPayments(owner);
    }

    @Mutation(returns => CreatePaymentOutput)
    @Role(["Owner"])
    createPayment(
        @AuthUser() owner: User,
        @Args("input") createPaymentInput: CreatePaymentInput
    ): Promise<CreatePaymentOutput> {
        return this.paymentService.createPayment(owner, createPaymentInput);
    }
}
