import { Category } from "@/utils";
import bbc from "./bbc";
import reuters from "./reuters";
import techcrunch from "./techcrunch";
import theverge from "./theverge";

export default new Category(
	"news",
	"**Latest news** and current events from around the world.",
).use({
	bbc,
	reuters,
	techcrunch,
	theverge,
});
