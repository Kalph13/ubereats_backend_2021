import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "src/users/entities/users.entity";
import { Restaurant } from "src/restaurants/entities/restaurants.entity";
import { Payment } from "./entities/payment.entity";
import { CreatePaymentInput, CreatePaymentOutput } from "./dtos/create-payment.dto";

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(Payment)
        private readonly payments: Repository<Payment>,
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>
    ) {}

    async createPayment(owner: User, { transactionId, restaurantId }: CreatePaymentInput): Promise<CreatePaymentOutput> {
        try {
            const restaurant = await this.restaurants.findOne({
                where: {
                    id: restaurantId
                }
            });

            if (!restaurant) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: "Couldn't find the restaurant"
                };
            }

            if (restaurant.ownerId !== owner.id) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: "You're not authorized"
                };
            }

            await this.payments.save(this.payments.create({
                transactionId,
                user: owner,
                restaurant
            }));

            return {
                GraphQLSucceed: true
            };
        } catch {
            return {
                GraphQLSucceed: false,
                GraphQLError: "Couldn't create the payment"
            };
        }
    }
}
