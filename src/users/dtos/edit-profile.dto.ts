import { InputType, PartialType, PickType, ObjectType } from "@nestjs/graphql";
import { User } from "../entities/users.entity";
import { GraphQLOutput } from "src/common/dtos/output.dto";

@InputType()
export class EditProfileInput extends PartialType(
    PickType(User, ['email', 'password'])
) {}

@ObjectType()
export class EditProfileOutput extends GraphQLOutput {}
