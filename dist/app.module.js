"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const apollo_1 = require("@nestjs/apollo");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const restaurants_module_1 = require("./restaurants/restaurants.module");
const orders_module_1 = require("./orders/orders.module");
const mail_module_1 = require("./mail/mail.module");
const jwt_module_1 = require("./jwt/jwt.module");
const common_module_1 = require("./common/common.module");
const payments_module_1 = require("./payments/payments.module");
const users_entity_1 = require("./users/entities/users.entity");
const verification_entity_1 = require("./users/entities/verification.entity");
const restaurants_entity_1 = require("./restaurants/entities/restaurants.entity");
const category_entity_1 = require("./restaurants/entities/category.entity");
const dish_entity_1 = require("./restaurants/entities/dish.entity");
const order_entity_1 = require("./orders/entities/order.entity");
const order_item_entity_1 = require("./orders/entities/order-item.entity");
const payment_entity_1 = require("./payments/entities/payment.entity");
const graphql_1 = require("@nestjs/graphql");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const Joi = require("joi");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
                ignoreEnvFile: process.env.NODE_ENV === 'prod',
                validationSchema: Joi.object({
                    NODE_ENV: Joi.string().valid('dev', 'prod', 'test').required(),
                    DB_HOST: Joi.string().required(),
                    DB_PORT: Joi.string().required(),
                    DB_USERNAME: Joi.string().required(),
                    DB_PASSWORD: Joi.string().required(),
                    DB_DATABASE: Joi.string().required(),
                    PRIVATE_KEY: Joi.string().required(),
                    MAILGUN_API_KEY: Joi.string().required(),
                    MAILGUN_DOMAIN_NAME: Joi.string().required(),
                    MAILGUN_FROM_EMAIL: Joi.string().required()
                })
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST,
                port: +process.env.DB_PORT,
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
                synchronize: process.env.NODE_ENV !== 'prod',
                entities: [users_entity_1.User, verification_entity_1.Verification, restaurants_entity_1.Restaurant, category_entity_1.Category, dish_entity_1.Dish, order_entity_1.Order, order_item_entity_1.OrderItem, payment_entity_1.Payment]
            }),
            graphql_1.GraphQLModule.forRoot({
                driver: apollo_1.ApolloDriver,
                autoSchemaFile: true,
                subscriptions: {
                    'graphql-ws': {
                        path: "/graphql",
                        onConnect: (context) => {
                            const { connectionParams, extra } = context;
                            console.log("------ AppModule Subscription------ context.connectionParams:", connectionParams);
                            extra.params = context.connectionParams;
                        }
                    }
                },
                context: ({ req, extra }) => {
                    const LOGINTOKEN_KEY = "x-jwt";
                    if (req) {
                        console.log("------ AppModule ------ req.headers['x-jwt']:", req.headers[LOGINTOKEN_KEY]);
                        return {
                            loggedInUser: req['loggedInUser'],
                            loginToken: req.headers[LOGINTOKEN_KEY]
                        };
                    }
                    else {
                        console.log("------ AppModule ------ extra.params['x-jwt']:", extra.params[LOGINTOKEN_KEY]);
                        return {
                            loginToken: extra.params[LOGINTOKEN_KEY]
                        };
                    }
                }
            }),
            jwt_module_1.JwtModule.forRoot({
                privateKey: process.env.PRIVATE_KEY
            }),
            mail_module_1.MailModule.forRoot({
                apiKey: process.env.MAILGUN_API_KEY,
                domain: process.env.MAILGUN_DOMAIN_NAME,
                fromEmail: process.env.MAILGUN_FROM_EMAIL
            }),
            auth_module_1.AuthModule,
            users_module_1.UserModule,
            restaurants_module_1.RestarantModule,
            orders_module_1.OrderModule,
            common_module_1.CommonModule,
            payments_module_1.PaymentModule
        ],
        controllers: [],
        providers: []
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map