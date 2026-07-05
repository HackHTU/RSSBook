import { Category } from "@/utils";
import htu from "./htu";

export default new Category(
	"school",
	"Educational resources, **school-related news**, and learning materials for students and teachers.",
).use({
	htu,
});
