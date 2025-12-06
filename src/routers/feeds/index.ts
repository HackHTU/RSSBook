import { Elysia } from "elysia";

import _example from "./_example";
import acg from "./acg";
import bbs from "./bbs";
import blog from "./blog";
import design from "./design";
import finance from "./finance";
import gaming from "./gaming";
import government from "./government";
import jobs from "./jobs";
import live from "./live";
import multimedia from "./multimedia";
import news from "./news";
import others from "./others";
import programming from "./programming";
import reading from "./reading";
import research from "./research";
import school from "./school";
import shopping from "./shopping";
import socialmedia from "./socialmedia";
import travel from "./travel";
import updates from "./updates";

export default new Elysia({
	name: "RSSBook/Router/Feeds",
	prefix: "/feeds",
}).use(
	[
		acg,
		bbs,
		design,
		finance,
		blog,
		gaming,
		government,
		jobs,
		live,
		multimedia,
		news,
		others,
		programming,
		reading,
		research,
		school,
		shopping,
		socialmedia,
		travel,
		updates,

		process.env.NODE_ENV !== "production" ? _example : undefined,
	]
		.filter((category) => !!category)
		.map((category) => category.getApp()),
);
