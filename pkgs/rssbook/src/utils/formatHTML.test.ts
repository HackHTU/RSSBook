import { describe, expect, test } from "bun:test";
import { formatHTML } from "@/utils";

describe("formatHTML", () => {
	test("should remove inline script and external script tags", () => {
		const src = `<div>
      <script>alert('xss')</script>
      <script src="/js/app.js"></script>
      <p>Hello World</p>
    </div>`;
		const result = formatHTML(src);
		expect(result).not.toContain("<script");
		expect(result).toContain("<div>");
		expect(result).toContain("<p>Hello World</p>");
	});

	test("should remove style tags, link rel=stylesheet and style attributes", () => {
		const src = `<div style="color:red">
      <style>body { background: red }</style>
      <link rel="stylesheet" href="/css/site.css">
      <p style="font-weight:bold">Styled</p>
    </div>`;
		const result = formatHTML(src);

		expect(result).not.toContain("<style");
		expect(result).not.toContain("<link");
		expect(result).not.toContain('style="');
		expect(result).toContain("<div");
		expect(result).toContain("<p>Styled</p>");
	});

	test("should remove JS in attributes and javascript: links", () => {
		const src = `<div>
      <a href="javascript:alert(1)" onclick="doBad()">Click me</a>
      <a href="/ok">Safe</a>
    </div>`;
		const result = formatHTML(src);

		expect(result).not.toContain("onclick=");
		expect(result).not.toContain("javascript:");
		expect(result).toContain('<a href="/ok">Safe</a>');
		expect(result).toContain(">Click me<");
	});

	test("should remove unsupported tags like iframe and keep semantic tags", () => {
		const src = `<div>
      <iframe src="https://evil.example.com"></iframe>
      <section><h1>Title</h1></section>
    </div>`;
		const result = formatHTML(src);

		expect(result).not.toContain("<iframe");
		expect(result).toContain("<section>");
		expect(result).toContain("<h1>Title</h1>");
	});

	test("should preserve images/videos/download links and convert simple relative paths to absolute", () => {
		const base = "https://example.com/blog/post.html";
		const src = `
      <img src="/images/root.png" alt="root">
      <img src="images/rel.jpg" alt="rel">
      <video src="./video.mp4" controls>
        <source src="../source.webm">
      </video>
      <a href="/files/my.pdf">DL</a>
      <a href="files/rel.pdf">DL2</a>
    `;
		const result = formatHTML(src, base);

		expect(result).toContain("img");
		expect(result).toContain("video");

		// to absolute URL: https://example.com/blog/post.html）
		// /images/root.png -> https://example.com/images/root.png
		expect(result).toContain("https://example.com/images/root.png");
		// images/rel.jpg -> https://example.com/blog/images/rel.jpg
		expect(result).toContain("https://example.com/blog/images/rel.jpg");
		// ./video.mp4 -> https://example.com/blog/video.mp4
		expect(result).toContain("https://example.com/blog/video.mp4");
		// ../source.webm -> https://example.com/source.webm
		expect(result).toContain("https://example.com/source.webm");
		// /files/my.pdf -> https://example.com/files/my.pdf
		expect(result).toContain("https://example.com/files/my.pdf");
		// files/rel.pdf -> https://example.com/blog/files/rel.pdf
		expect(result).toContain("https://example.com/blog/files/rel.pdf");
	});

	test("full integration: complex fragment keeps semantics but strips styles + JS", () => {
		const base = "https://example.com/path/page.html";
		const src = `
      <article class="post" style="background:url('/bad.png')">
        <header onclick="pwn()"> <h2>Post</h2> </header>
        <img src="../img.jpg" style="width:100px">
        <p>Content <a href="javascript:alert(1)">badlink</a></p>
        <script>evil()</script>
        <link rel="stylesheet" href="theme.css">
        <iframe src="x"></iframe>
        <a href="/download/file.zip" download>Get</a>
      </article>
    `;
		const result = formatHTML(src, base);

		expect(result).not.toContain("<script");
		expect(result).not.toContain("<style");
		expect(result).not.toContain("onclick=");
		expect(result).not.toContain("javascript:");
		expect(result).not.toContain("<iframe");

		expect(result).toContain("<article");
		expect(result).toContain("<h2>Post</h2>");
		expect(result).toContain("https://example.com/img.jpg"); // ../img.jpg -> https://example.com/img.jpg
		expect(result).toContain("https://example.com/download/file.zip");
		expect(result).toContain("download");
	});

	test("should convert audio src to absolute URL", () => {
		const base = "https://example.com/page.html";
		const src = '<audio src="/audio/test.mp3"></audio>';
		const result = formatHTML(src, base);
		expect(result).toContain("https://example.com/audio/test.mp3");
	});

	test("should convert img srcset to absolute URLs", () => {
		const base = "https://example.com/page.html";
		const src = '<img srcset="/img/small.jpg 300w, /img/large.jpg 600w" src="/img/default.jpg">';
		const result = formatHTML(src, base);
		expect(result).toContain("https://example.com/img/default.jpg");
		expect(result).toContain("https://example.com/img/small.jpg");
		expect(result).toContain("https://example.com/img/large.jpg");
	});

	test("should convert source srcset to absolute URLs", () => {
		const base = "https://example.com/page.html";
		const src = '<picture><source srcset="/img/small.webp 300w, /img/large.webp 600w"></picture>';
		const result = formatHTML(src, base);
		expect(result).toContain("https://example.com/img/small.webp");
		expect(result).toContain("https://example.com/img/large.webp");
	});

	test("should convert source src to absolute URL", () => {
		const base = "https://example.com/page.html";
		const src = '<video><source src="/video/clip.mp4"></video>';
		const result = formatHTML(src, base);
		expect(result).toContain("https://example.com/video/clip.mp4");
	});

	test("should convert track src to absolute URL", () => {
		const base = "https://example.com/page.html";
		const src = '<video><track src="/subs/en.vtt"></video>';
		const result = formatHTML(src, base);
		expect(result).toContain("https://example.com/subs/en.vtt");
	});

	test("should convert video src and poster to absolute URLs", () => {
		const base = "https://example.com/page.html";
		const src = '<video src="/video/main.mp4" poster="/img/poster.jpg"></video>';
		const result = formatHTML(src, base);
		expect(result).toContain("https://example.com/video/main.mp4");
		expect(result).toContain("https://example.com/img/poster.jpg");
	});
});
