import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { GraphQLOutput } from "src/common/dtos/output.dto";
import { Order } from "../entities/order.entity";

@InputType()
export class GetOrderInput extends PickType(Order, ["id"]) {}

@ObjectType()
export class GetOrderOutput extends GraphQLOutput {
    @Field(type => Order, { nullable: true })
    order?: Order;
}
