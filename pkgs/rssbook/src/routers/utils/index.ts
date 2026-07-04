import Elysia from "elysia";
import fetch from "./fetch";
import filter from "./filter";
import intersection from "./intersection";
import sort from "./sort";
import transform from "./transform";
import union from "./union";

export default new Elysia({
	name: "RSSBook/Router/Utils",
	prefix: "/utils",
	tags: ["utils"],
}).use([fetch, filter, intersection, sort, union, transform]);
