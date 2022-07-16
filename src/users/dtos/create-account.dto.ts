import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { User } from "../entities/users.entity";
import { MutationOutput } from "src/common/dtos/output.dto";

@InputType()
export class CreateAccountInput extends PickType(User, [
    'email',
    'password',
    'role'
]) {}

@ObjectType()
/* Replaced by MutationOutput */
/* export class CreateAccountOutput {
    @Field(type => String, { nullable: true })
    createAccountError?: string;

    @Field(type => Boolean)
    createAccountSucceed?: boolean;
} */
export class CreateAccountOutput extends MutationOutput {}
