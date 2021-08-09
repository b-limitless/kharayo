import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  OneToMany
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { Post } from "./Post";
// If you do not want to expose any coloum
// Just remove @Filed() from specific column
// thus: Api will have no access of it

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column({ unique: true })
  username!: string;

  @Field(() => String)
  @Column({ unique: true })
  email!: string;

  @Column({ type: "text" })
  password!: string;
  
  @OneToMany(() => Post, post => post.creator)
  posts: Post[];

  @Field(() => String)
  @CreateDateColumn()
  createdA = new Date();

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = new Date();

}
