import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/users.entity";
import { CreateAccountInput } from "./dtos/create-account.dto";
import { LoginInput } from "./dtos/login.dto";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>
    ) {}

    async getAll(): Promise<User[]> {
        return this.users.find();
    }

    async createAccount({ email, password, role }: CreateAccountInput): Promise<{
        mutationSucceed: boolean; 
        mutationError?: string;
    }> {
        try {
            const existingUser = await this.users.findOne({ where: { email } });
            if (existingUser) {
                return {
                    mutationSucceed: false,
                    mutationError: "The username already exists"
                }
            }
            await this.users.save(this.users.create({ email, password, role }))
            return {
                mutationSucceed: true
            }
        } catch (e) {
            return {
                mutationSucceed: false,
                mutationError: "Couldn't create the account"
            }
        }
    }

    async login({ email, password }: LoginInput): Promise<{
        mutationSucceed: boolean;
        mutationError?: string;
        loginToken?: string;  
    }> {
        try {
            const loggedInUser = await this.users.findOne({ where: { email } });
            if (!loggedInUser) {
                return {
                    mutationSucceed: false,
                    mutationError: 'The user is not found'
                }
            }

            const checkPassword = await loggedInUser.checkPassword(password);
            if (!checkPassword) {
                return {
                    mutationSucceed: false,
                    mutationError: 'the password is wrong'
                }
            }

            return {
                mutationSucceed: true,
                loginToken: 'sample token'
            }
        } catch (mutationError) {
            return {
                mutationSucceed: false,
                mutationError
            }
        }
    }
}
