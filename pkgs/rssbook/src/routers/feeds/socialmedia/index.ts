import { Category } from "@/utils";
import bilibili from "./bilibili";
import bsky from "./bsky";
import discord from "./discord";
import douban from "./douban";
import mastodon from "./mastodon";
import telegram from "./telegram";
import zhihu from "./zhihu";

export default new Category(
	"socialmedia",
	"Content and discussions from **social networking platforms**, trends, and viral posts.",
).use({
	bilibili,
	bsky,
	discord,
	douban,
	mastodon,
	telegram,
	zhihu,
});
