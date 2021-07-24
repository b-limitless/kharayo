import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import mikroOrmConfig from "./mikro-orm.config";

export const main = async() => {
    const orm = await MikroORM.init(mikroOrmConfig);
    const post = orm.em.create(Post, {title: 'hello world'});
    await orm.em.persistAndFlush(post);
    return orm;
}

main().catch(err => {
    console.log(err)
});