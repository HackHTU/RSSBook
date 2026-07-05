import { Category } from "@/utils";
import cls from "./cls";
import gelonghui from "./gelonghui";
import wallstreetcn from "./wallstreetcn";

export default new Category(
	"finance",
	"Information on **financial markets, investments, and personal finance**, including news and analysis.",
).use({
	cls,
	gelonghui,
	wallstreetcn,
});
