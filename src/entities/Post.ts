import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
} from "typeorm";

import { Field, ObjectType } from "type-graphql";
import { User } from "./User";
// If you do not want to expose any coloum
// Just remove @Filed() from specific column
// thus: Api will have no access of it

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt = new Date();

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = new Date();

  @Field(() => String)
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({type: "int", default: 0})
  points!: number;

  @Field()
  @Column()
  creatorId: number;

  @ManyToOne(() => User, user => user.posts)
  creator: User;

}
