import { Field, ObjectType } from "@nestjs/graphql";
import { GraphQLOutput } from "src/common/dtos/output.dto";
import { Payment } from "../entities/payment.entity";

@ObjectType()
export class GetPaymentsOutput extends GraphQLOutput {
    @Field(type => [Payment], { nullable: true })
    payments?: Payment[];
}
