import { Args, Resolver, Query, Mutation, Context } from "@nestjs/graphql";
import { User } from "./entities/users.entity";
import { UserService } from "./users.service";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { UserProfileInput, UserProfileOutput } from "./dtos/user-profile.dto";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";

/* UseGuards: https://docs.nestjs.com/security/authentication#login-route */
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { AuthUser } from "src/auth/auth-user.decorator";

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

    @Query(returns => User)
    /* Replaced by UseGuards */
    /* async findMe(@Context() context) {
        console.log("------ findMe ------ context:", context.user);
        if (!context.user) {
            return;
        } else {
            return context.user;
        }
    } */
    @UseGuards(AuthGuard)
    async findMe(@AuthUser() authUser: User) {
        return authUser;
    }
    /* 
        HTTP Header
        {
            "x-jwt": Insert loginToken
        }

        query FindMe {
            findMe {
                email
                password
                role
            }
        }
    */

    @Query(returns => UserProfileOutput)
    @UseGuards(AuthGuard)
    async userProfile(
        @Args() userProfileInput: UserProfileInput
    ): Promise<UserProfileOutput> {
        try {
            const user = await this.userService.findById(userProfileInput.userId);
            
            if (!user) {
                throw Error();
            }

            return{
                GraphQLSucceed: true,
                user
            }
        } catch (GraphQLError) {
            return {
                GraphQLSucceed: false,
                GraphQLError
            }
        }
    }
    /* 
        VARIABLES
        {
            "userId": 1
        }

        query UserProfile ($userId: Float!) {
            userProfile (userId: $userId) {
                GraphQLSucceed
                GraphQLError
                user {
                    email
                    password
                    role
                }
            }
        }
    */

    @Mutation(returns => CreateAccountOutput)
    async createAccount(
        @Args('input') createAccountInput: CreateAccountInput
    ): Promise<CreateAccountOutput> {
        try {
            return this.userService.createAccount(createAccountInput);
        } catch (GraphQLError) {
            return {
                GraphQLSucceed: false,
                GraphQLError
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
                GraphQLSucceed
                GraphQLError
            }
        }
    */

    @Mutation(returns => LoginOutput)
    async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
        try {
            return this.userService.login(loginInput);
        } catch (GraphQLError) {
            return {
                GraphQLSucceed: false,
                GraphQLError
            }
        }
    }

    @UseGuards(AuthGuard)
    @Mutation(returns => EditProfileOutput)
    async editProfile(
        @AuthUser() authUser: User,
        @Args('input') editProfileInput: EditProfileInput
    ): Promise<EditProfileOutput> {
        try {
            await this.userService.editProfile(authUser.id, editProfileInput);
            return {
                GraphQLSucceed: true
            }
        } catch (GraphQLError) {
            return {
                GraphQLSucceed: false,
                GraphQLError
            }
        }
    }
}
