import { Arg, Ctx, Query, Resolver, Int, Mutation } from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { title } from "process";
@Resolver()
export class PostResolver {
    @Query(() => [Post]) 
    posts(
        @Ctx() {em}: MyContext
    ): Promise<Post[]> {
        return em.find(Post, {});
    }

    @Query(() => Post, {nullable: true}) 
    post(
        @Arg('id') id: number,
        @Ctx() {em}: MyContext
    ): Promise<Post | null> {
        return em.findOne(Post, { id });
    }

    @Mutation(() => Post) 
    async createPost(
        @Arg('title') title: string,
        @Ctx() {em}: MyContext
    ): Promise<Post> {
        const post = em.create(Post, {title});
        await em.persistAndFlush(post);
        return post;
    }
}