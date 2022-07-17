import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/users.entity";
import { CreateAccountInput } from "./dtos/create-account.dto";
import { LoginInput } from "./dtos/login.dto";
import * as jwt from "jsonwebtoken";
import { JwtService } from "src/jwt/jwt.service";

/* Replaced by JwtService */
/* ConfigService: https://docs.nestjs.com/techniques/configuration#using-the-configservice */
import { ConfigService } from "@nestjs/config";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
        /* Replaced by JwtService */
        /* private readonly configService: ConfigService, */
        private readonly jwtService: JwtService
    ) {}

    async getAll(): Promise<User[]> {
        return this.users.find();
    }

    async createAccount({ email, password, role }: CreateAccountInput): Promise<{
        GraphQLSucceed: boolean; 
        GraphQLError?: string;
    }> {
        try {
            const existingUser = await this.users.findOne({ where: { email } });
            if (existingUser) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: "The username already exists"
                }
            }
            await this.users.save(this.users.create({ email, password, role }))
            return {
                GraphQLSucceed: true
            }
        } catch (e) {
            return {
                GraphQLSucceed: false,
                GraphQLError: "Couldn't create the account"
            }
        }
    }

    async login({ email, password }: LoginInput): Promise<{
        GraphQLSucceed: boolean;
        GraphQLError?: string;
        loginToken?: string;
    }> {
        try {
            const loggedInUser = await this.users.findOne({ where: { email } });
            if (!loggedInUser) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: 'The user is not found'
                }
            }

            const checkPassword = await loggedInUser.checkPassword(password);
            if (!checkPassword) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: 'the password is wrong'
                }
            }

            /* Replaced by JwtService */
            /* const loginToken = jwt.sign( { id: loggedInUser.id }, this.configService.get('PRIVATE_KEY')); */
            const loginToken = this.jwtService.sign(loggedInUser.id);
            return {
                GraphQLSucceed: true,
                loginToken
            }
        } catch (GraphQLError) {
            return {
                GraphQLSucceed: false,
                GraphQLError
            }
        }
    }

    async findById(id: number): Promise<User> {
        return this.users.findOne({ where: { id } });
    }
}
