import { Category } from "@/utils";
import cyzone from "./cyzone";
import geekpark from "./geekpark";
import huxiu from "./huxiu";
import ifanr from "./ifanr";
import ithome from "./ithome";
import kr36 from "./kr36";
import leiphone from "./leiphone";
import pingwest from "./pingwest";
import solidot from "./solidot";
import sspai from "./sspai";
import thepaper from "./thepaper";

export default new Category(
	"multimedia",
	"Various **media content**, including videos, audio, images, and interactive media.",
).use({
	cyzone,
	geekpark,
	huxiu,
	ifanr,
	ithome,
	kr36,
	leiphone,
	pingwest,
	solidot,
	sspai,
	thepaper,
});
