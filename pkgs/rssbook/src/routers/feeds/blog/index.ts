import { Category } from "@/utils";
import medium from "./medium";
import substack from "./substack";

export default new Category(
	"blog",
	"Personal or professional **blogs** covering various topics, stories, and experiences.",
).use({
	medium,
	substack,
});
