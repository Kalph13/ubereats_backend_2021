import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/users.entity";
import { CreateAccountInput } from "./dtos/create-account.dto";

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
        createAccountSucceed: boolean; 
        createAccountError?: string;
    }> {
        try {
            const existingUser = await this.users.findOne({ where: { email } });
            if (existingUser) {
                return {
                    createAccountSucceed: false,
                    createAccountError: "The username already exists"
                }
            }
            await this.users.save(this.users.create({ email, password, role }))
            return {
                createAccountSucceed: true
            }
        } catch (e) {
            return {
                createAccountSucceed: false,
                createAccountError: "Couldn't create the account"
            }
        }
    }
}