import { ObjectType, InputType, registerEnumType, Field } from "@nestjs/graphql";
import { InternalServerErrorException } from "@nestjs/common";
import { Entity, Column, BeforeInsert } from "typeorm";
import { CoreEntity } from "src/common/entities/core.entity";
import * as bcrypt from "bcrypt";

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

    @BeforeInsert()
    async hashPassword(): Promise<void> {
        try { 
            this.password = await bcrypt.hash(this.password, 10);
        } catch (e) {
            console.log(e)
            throw new InternalServerErrorException();
        }
    }
}
