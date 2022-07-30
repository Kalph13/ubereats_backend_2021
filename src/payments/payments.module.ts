import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentResolver } from "./payments.resolver";
import { PaymentService } from "./payments.service";
import { Payment } from "./entities/payment.entity";
import { Restaurant } from "src/restaurants/entities/restaurants.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Payment, Restaurant])],
    providers: [PaymentResolver, PaymentService]
})
export class PaymentModule {}
