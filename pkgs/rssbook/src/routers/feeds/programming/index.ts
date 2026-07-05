import { Category } from "@/utils";
import github from "./github";
import hackernews from "./hackernews";
import v2ex from "./v2ex";

export default new Category(
	"programming",
	"Resources, tutorials, and discussions about **coding, software development, and tech projects**.",
).use({
	github,
	hackernews,
	v2ex,
});
