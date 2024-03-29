import { Field, Float, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, RelationId } from "typeorm";
import { IsEnum, IsNumber } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { User } from "src/users/entities/users.entity";
import { Restaurant } from "src/restaurants/entities/restaurants.entity";
import { OrderItem } from "./order-item.entity";

export enum OrderStatus {
    Pending = "Pending",
    Cooking = "Cooking",
    Cooked = "Cooked",
    PickedUp = "PickedUp",
    Delivered = "Delivered"
}
registerEnumType(OrderStatus, { name: "OrderStatus" });

/* Eager and Lazy Relations: https://typeorm.io/eager-and-lazy-relations */
/* Without 'eager: true': query getOrders returns 'null's for relations fields (customer, driver, restaurant, and items) */ 
@InputType("OrderInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
    @Field(type => User, { nullable: true })
    @ManyToOne(
        type => User,
        user => user.orders,
        { onDelete: "SET NULL", nullable: true }
    )
    customer?: User;

    @RelationId((order: Order) => order.customer)
    customerId: number;

    @Field(type => User, { nullable: true })
    @ManyToOne(
        type => User,
        user => user.rides,
        { onDelete: "SET NULL", nullable: true }
    )
    driver?: User;

    @RelationId((order: Order) => order.driver)
    driverId: number;

    @Field(type => Restaurant, { nullable: true })
    @ManyToOne(
        type => Restaurant,
        restaurant => restaurant.orders,
        { onDelete: "SET NULL", nullable: true }
    )
    restaurant?: Restaurant;

    @Field(type => [OrderItem])
    @ManyToMany(type => OrderItem, { eager: true })
    @JoinTable()
    items: OrderItem[];

    @Field(type => Float, { nullable: true })
    @Column({ nullable: true })
    @IsNumber()
    total?: number;

    @Field(type => OrderStatus)
    @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.Pending })
    @IsEnum(OrderStatus)
    status: OrderStatus;
}
