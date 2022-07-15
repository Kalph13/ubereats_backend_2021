import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { User } from "../entities/users.entity";

@InputType()
export class CreateAccountInput extends PickType(User, [
    'email',
    'password',
    'role'
]) {}

@ObjectType()
export class CreateAccountOutput {
    @Field(type => String, { nullable: true })
    createAccountError?: string;
    @Field(type => Boolean)
    createAccountSucceed?: boolean;
}
