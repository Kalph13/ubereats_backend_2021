import { Args, Resolver, Query, Mutation, Context } from "@nestjs/graphql";
import { User } from "./entities/users.entity";
import { UserService } from "./users.service";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { UserProfileInput, UserProfileOutput } from "./dtos/user-profile.dto";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { VerifyEmailInput, VerifyEmailOutput } from "./dtos/verify-email.dto";

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

    @Query(returns => User)
    /* Replaced by UseGuards */
    /* async findMe(@Context() context) {
        if (!context.user) return;
        else return context.user;
    } */
    @UseGuards(AuthGuard)
    async findMe(
        @AuthUser() authUser: User
    ) {
        return authUser;
    }

    @Query(returns => UserProfileOutput)
    @UseGuards(AuthGuard)
    async userProfile(
        @Args() userProfileInput: UserProfileInput
    ): Promise<UserProfileOutput> {
        return this.userService.findById(userProfileInput.userId);
    }

    @Mutation(returns => CreateAccountOutput)
    async createAccount(
        @Args('input') createAccountInput: CreateAccountInput
    ): Promise<CreateAccountOutput> {
        return this.userService.createAccount(createAccountInput);
    }

    @Mutation(returns => LoginOutput)
    async login(
        @Args('input') loginInput: LoginInput
    ): Promise<LoginOutput> {
        return this.userService.login(loginInput);
    }

    @Mutation(returns => EditProfileOutput)
    @UseGuards(AuthGuard)
    async editProfile(
        @AuthUser() authUser: User,
        @Args('input') editProfileInput: EditProfileInput
    ): Promise<EditProfileOutput> {
        return this.userService.editProfile(authUser.id, editProfileInput);
    }

    @Mutation(returns => VerifyEmailOutput)
    async verifyEmail(
        @Args('input') { code }: VerifyEmailInput
    ): Promise<VerifyEmailOutput> {
        return this.userService.verifyEmail(code);
    }
}

/* 
------ Query users ------
query Users {
    users {
        email
        password
        role
    }
}

------ Query findMe ------
HTTP Header
{
    "x-jwt": "***" (Login Token, String)
}

query FindMe {
    findMe {
        email
        password
        role
    }
}

------ Query UserProfile ------
VARIABLES
{
    "userId": *** (User ID, Number)
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

------ Mutation CreateAccount ------
mutation CreateAccount {
    createAccount(input: {
        email: "***",
        password: "***",
        role: Owner | Client | Delivery
    }) {
        GraphQLSucceed
        GraphQLError
    }
}

------ Mutation Login ------
mutation Login {
    login (input: {
        email: "***",
        password: "***",
    }) {
        GraphQLSucceed
        GraphQLError
        loginToken
    }
}

------ Mutation EditProfile ------
mutation EditProfile {
    editProfile(input: {
        email: "***"
        password: "***"
    }) {
        GraphQLSucceed
        GraphQLError
    }
}

------ Mutation VerifyEmail ------
mutation VerifyEmail {
    verifyEmail (input: {
        code: "***" (The Code Generated in CreateAccount)
    }) {
        GraphQLSucceed
        GraphQLError
    }
}
*/
