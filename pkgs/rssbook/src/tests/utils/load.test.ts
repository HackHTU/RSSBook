import { describe, expect, test } from "bun:test";
import { load } from "@/utils";

describe("load", () => {
	// language=html
	const basicHTML = `
    <!DOCTYPE html>
    <html>
	  <head>
		<title>Test Document</title>
		<description>This is a test HTML document.</description>
	  </head>
      <body>
        <h1 class="title">Hello World</h1>
        <div id="container">
          <p>First paragraph</p>
          <ul class="list">
            <li data-index="1">Item 1</li>
            <li data-index="2">Item 2</li>
          </ul>
        </div>
      </body>
    </html>
  `;

	test("should parse basic HTML structure", () => {
		const $ = load(basicHTML);

		expect($("title").text()).toBe("Test Document");
		expect($("description").text()).toBe("This is a test HTML document.");
		expect($("h1.title").text()).toBe("Hello World");
		expect($("#container").length).toBe(1);
		expect($("ul.list li").length).toBe(2);
	});

	test("should handle malformed HTML", () => {
		const malformedHTML = `<div><p>Unclosed<div>`;
		const $ = load(malformedHTML);

		expect($("div").length).toBe(2);
		expect($("p").text()).toBe("Unclosed");
	});

	test("should support DOM manipulation", () => {
		const $ = load(basicHTML);

		$("h1.title").text("Modified Title");
		$("#container").append("<p>New paragraph</p>");
		$("li[data-index='1']").remove();

		expect($("h1").text()).toBe("Modified Title");
		expect($("#container p").length).toBe(2);
		expect($("#container p:last-child").text()).toBe("New paragraph");
		expect($(".list li").length).toBe(1);
	});

	test("should handle attributes correctly", () => {
		const $ = load(basicHTML);

		expect($("li").first().attr("data-index")).toBe("1");

		$("h1").attr("id", "main-header");

		$("ul").removeAttr("class");

		expect($("#main-header").length).toBe(1);
		expect($("ul[class]").length).toBe(0);
	});

	test("should serialize to HTML correctly", () => {
		const $ = load("<div>Test</div>");
		expect($.html()).toContain("<div>Test</div>");

		const fragment = load("<span>1</span><span>2</span>");
		expect(fragment("body").html()).toMatchInlineSnapshot(`"<span>1</span><span>2</span>"`);
	});

	test("should handle selector edge cases", () => {
		const $ = load(`<div class="a.b">Escaped</div>`);

		expect($('div[class="a.b"]').text()).toBe("Escaped");

		expect($("").length).toBe(0);

		expect($(".non-existent").length).toBe(0);
	});

	test("should handle special characters", () => {
		const $ = load(`<div>&amp; &lt; &gt;</div>`);
		expect($("div").html()).toBe("&amp; &lt; &gt;");

		const xssAttempt = load(`<script>alert('xss')</script>`);
		expect(xssAttempt("script").length).toBe(1);
	});
});
