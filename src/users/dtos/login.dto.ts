import { InputType, PickType, ObjectType, Field } from "@nestjs/graphql";
import { User } from "../entities/users.entity";
import { MutationOutput } from "src/common/dtos/output.dto";

@InputType()
export class LoginInput extends PickType(User, [
    'email',
    'password'
]) {}

@ObjectType()
export class LoginOutput extends MutationOutput {
    @Field(type => String, { nullable: true })
    loginToken?: string;
}
