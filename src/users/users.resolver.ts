import { Args, Resolver, Query, Mutation} from "@nestjs/graphql";
import { User } from "./entities/users.entity";
import { UserService } from "./users.service";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";

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
            return this.userService.createAccount(createAccountInput);
        } catch (mutationError) {
            return {
                mutationSucceed: false,
                mutationError
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
                mutationSucceed
                mutationError
            }
        }
    */

    @Mutation(returns => LoginOutput)
    async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
        try {
            return this.userService.login(loginInput);
        } catch (mutationError) {
            return {
                mutationSucceed: false,
                mutationError
            }
        }
    }
}
