import {Entity, PrimaryKey, Property} from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';

// If you do not want to expose any coloum 
// Just remove @Filed() from specific column
// thus: Api will have no access of it

@ObjectType()
@Entity()
export class Post {
  @Field()
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({type: 'date'})
  createdAt: Date = new Date();

  @Field(() => String)
  @Property({type: 'date', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Field(() => String)
  @Property({type: 'text'})
  title!: string;

}