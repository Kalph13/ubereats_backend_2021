import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, Repository } from "typeorm";
import { User } from "src/users/entities/users.entity";
import { Restaurant } from "src/restaurants/entities/restaurants.entity";
import { Payment } from "./entities/payment.entity";
import { CreatePaymentInput, CreatePaymentOutput } from "./dtos/create-payment.dto";
import { GetPaymentsOutput } from "./dtos/get-payments.dto";

/* Task Scheduling: https://docs.nestjs.com/techniques/task-scheduling */
import { Cron, Interval, SchedulerRegistry, Timeout } from "@nestjs/schedule";

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(Payment)
        private readonly payments: Repository<Payment>,
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>,
        private schedulerRegistry: SchedulerRegistry
    ) {}

    async getPayments(owner: User): Promise<GetPaymentsOutput> {
        try {
            const payments = await this.payments.find({
                where: {
                    restaurant: {
                        owner: {
                            id: owner.id
                        }
                    }
                }
            });

            return {
                GraphQLSucceed: true,
                payments
            }
        } catch {
            return {
                GraphQLSucceed: false,
                GraphQLError: "Couldn't find payments"
            }
        }
    }

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

            restaurant.isPromoted = true;
            const date = new Date();
            date.setDate(date.getDate() + 7);
            restaurant.promotedUntil = date;
            this.restaurants.save(restaurant);

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

    /* Cron: Run Once at a Specified Date and Time on a Recurring Basis (https://docs.nestjs.com/techniques/task-scheduling#declarative-cron-jobs) */
    /* Cron vs. Interval: https://darrengwon.tistory.com/1103 */
    /* @Cron("30 * * * * *", { name: "paymentJob" })
    checkForPayments() {
        console.log("------ Cron is Checking for Payments ------");
        const job = this.schedulerRegistry.getCronJob("paymentJob");
        job.stop();
    } */

    /* @Interval(2000) */
    async checkPromotedRestaurants() {
        const restaurants = await this.restaurants.find({
            where: {
                isPromoted: true,
                promotedUntil: LessThan(new Date())
            }
        });
        
        console.log("------ CheckPromotedRestaurant (Interval: 2000) ------ restaurants:", restaurants);
        
        restaurants.forEach(async restaurants => {
            restaurants.isPromoted = false;
            restaurants.promotedUntil = null;
            await this.restaurants.save(restaurants);
        });
    }
}
