import { InputType, PickType, ObjectType } from "@nestjs/graphql";
import { GraphQLOutput } from "src/common/dtos/output.dto";
import { Verification } from "../entities/verification.entity";

@InputType()
export class VerifyEmailInput extends PickType(Verification, ['code']) {}

@ObjectType()
export class VerifyEmailOutput extends GraphQLOutput {}
