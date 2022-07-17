import { ObjectType, InputType, registerEnumType, Field } from "@nestjs/graphql";
import { InternalServerErrorException } from "@nestjs/common";
import { Entity, Column, BeforeInsert, BeforeUpdate } from "typeorm";
import { CoreEntity } from "src/common/entities/core.entity";
import { IsEmail, IsEnum } from "class-validator";
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
    @IsEmail()
    email: string;
    
    @Column({ select: false })
    @Field(type => String)
    password: string;
    
    /* Replaced by Enum */
    /* @Column()
    @Field(type => String) */
    @Column({ type: 'enum', enum: UserRole })
    @Field(type => UserRole)
    @IsEnum(UserRole)
    role: UserRole;

    @Column({ default: false })
    @Field(type => Boolean)
    verified: boolean;

    /* @BeforeInsert: https://typeorm.io/listeners-and-subscribers#beforeinsert */
    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword(): Promise<void> {
        if(this.password) {
            try { 
                this.password = await bcrypt.hash(this.password, 10);
            } catch (e) {
                console.log(e)
                throw new InternalServerErrorException();
            }
        }
    }

    async checkPassword(receivedPassword: string): Promise<boolean> {
        try {
            const result = await bcrypt.compare(receivedPassword, this.password);
            return result;
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException();
        }
    }
}
