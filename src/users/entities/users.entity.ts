import { ObjectType, InputType, registerEnumType, Field } from "@nestjs/graphql";
import { Column, Entity } from "typeorm";
import { CoreEntity } from "src/common/entities/core.entity";

/* Replaced by Enum */
/* type UserRole = 'client' | 'owner' | 'delivery'; */

/* Enum: https://docs.nestjs.com/graphql/unions-and-enums#enums */
enum UserRole { Client, Owner, Delivery }
registerEnumType(UserRole, { name: 'UserRole' });

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
    @Column()
    @Field(type => String)
    email: string;
    @Column()
    @Field(type => String)
    password: string;
    /* @Column()
    @Field(type => String) */
    @Column({ type: 'enum', enum: UserRole })
    @Field(type => UserRole)
    role: UserRole;
}
