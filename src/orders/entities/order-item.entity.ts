import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, ManyToOne } from "typeorm";
import { CoreEntity } from "src/common/entities/core.entity";
import { Dish } from "src/restaurants/entities/dish.entity";

@InputType("OrderItemOptionInputType", { isAbstract: true })
@ObjectType()
export class OrderItemOption {
    @Field(type => String)
    name: string;
    
    @Field(type => String)
    choice: string;

    /* @Field(type => String, { nullable: true })
    choices?: string;

    @Field(type => Int, { nullable: true })
    extra?: number; */
}

@InputType("OrderItemInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
    @Field(type => Dish)
    @ManyToOne(
        type => Dish,
        { nullable: true, onDelete: "CASCADE", eager: true }
    )
    dish: Dish;

    @Field(type => [OrderItemOption], { nullable: true })
    @Column({ type: "json", nullable: true })
    options?: OrderItemOption[];
}
