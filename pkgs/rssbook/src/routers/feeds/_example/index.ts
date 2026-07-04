/**
 * Example category and example source
 * 示例分类和示例源
 *
 * This file will not be loaded in production mode
 * 生产模式将不会加载此文件
 *
 * This file demonstrates how to define a category and add multiple sources
 * 这个文件展示了如何定义一个分类并添加多个源
 */

import { Category } from "@/utils";

import _api from "./_api";
import _html from "./_html";

/**
 * `routers/feeds` shows all categories. The `index.ts` file in each category folder defines
 * the category information and all contained sources.
 * Each category uses the `Category` class to define, and can contain multiple sources (Source).
 * In this example, we define a category named `_example` and add two sources: `_api` and `_html`.
 *
 * `routers/feeds` 里展示了所有分类，在分类文件夹里的 `index.ts` 文件中定义了该分类的信息和包含的所有源。
 * 每个分类使用 `Category` 类来定义，分类可以包含多个源（Source）。
 * 在这个例子中，我们定义了一个名为 `_example` 的分类，并为其添加了两个源：`_api` 和 `_html`。
 *
 * We use the `.use(sources)` method to add sources to the category. For alphabetical ordering,
 * the `sources` parameter is an object.
 * 我们使用 `.use(sources)` 方法将源添加到分类中。为了按照字母排序，`sources` 参数是一个对象。
 *
 * We need to import each source module at the top and pass them as object properties to `.use()`.
 * 我们需要在顶部导入每个源模块，并将它们作为对象的属性传递给 `.use()` 方法。
 *
 * Note: Category and source naming should follow the project's naming conventions.
 * Do not use the `as` keyword to rename imported modules, to ensure code consistency and readability.
 *
 * 注意：分类和源的命名应遵循项目的命名规范，不要使用 `as` 关键字重命名导入的模块，以确保代码的一致性和可读性。
 */
export default new Category("_example", "This is an example feed category.").use({
	_api, // Source that fetches data from an API / 从 API 获取数据的源
	_html, // Source that scrapes data from HTML pages / 从 HTML 页面抓取数据的源
});
