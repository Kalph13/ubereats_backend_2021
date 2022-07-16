import { Args, Resolver, Query, Mutation} from "@nestjs/graphql";
import { User } from "./entities/users.entity";
import { UserService } from "./users.service";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";

@Resolver(of => User)
export class UserResolver {
    constructor(
        private readonly userService: UserService
    ) {}

    @Query(returns => [User])
    async users(): Promise<User[]> {
        return this.userService.getAll();
    }
    /* 
        query Users {
            users {
                email
                password
                role
            }
        }
    */
   
    @Mutation(returns => CreateAccountOutput)
    async createAccount(
        @Args('input') createAccountInput: CreateAccountInput
    ): Promise<CreateAccountOutput> {
        try {
            const { createAccountSucceed, createAccountError } = await this.userService.createAccount(createAccountInput);
            return {
                createAccountSucceed,
                createAccountError
            }
        } catch (createAccountError) {
            return {
                createAccountSucceed: false,
                createAccountError
            }
        }
    }
    /* 
        mutation CreateAccount {
            createAccount(input: {
                email: "soonsoon.kim@gmail.com",
                password: "test1234",
                role: Owner
            }) {
                createAccountSucceed
                createAccountError
            }
        }
    */
}
