<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom">
	<xsl:output method="html" encoding="UTF-8" indent="yes"/>
	<xsl:strip-space elements="*"/>

	<xsl:param name="home-url" select="'/'"/>

	<xsl:template match="/">
		<xsl:apply-templates select="atom:feed"/>
	</xsl:template>

	<xsl:template match="atom:feed">
		<xsl:variable name="feedLang" select="string(@xml:lang)"/>
		<xsl:variable name="feedTitle" select="normalize-space(atom:title)"/>
		<xsl:variable name="feedSub" select="normalize-space(atom:subtitle)"/>
		<html>
			<xsl:if test="string($feedLang)">
				<xsl:attribute name="lang"><xsl:value-of select="$feedLang"/></xsl:attribute>
			</xsl:if>
			<head>
				<meta charset="UTF-8"/>
				<meta name="viewport" content="width=device-width, initial-scale=1"/>
				<meta name="color-scheme" content="light dark"/>
				<title>
					<xsl:choose>
						<xsl:when test="string($feedTitle)"><xsl:value-of select="$feedTitle"/></xsl:when>
						<xsl:otherwise>Atom Feed</xsl:otherwise>
					</xsl:choose>
				</title>
				<style type="text/css"><![CDATA[
					html { font-size: 16px; }
					body { margin: 0; font-family: "SF Pro Display", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif; background: #fcf6f6; color: #231f20; line-height: 1.6; }
					a { color: #ff2d31; text-decoration: none; }
					a:hover { text-decoration: underline; }
					.page { padding: 2.5rem 1rem 4rem; max-width: 960px; margin: 0 auto; }
					.header { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
					.home-link { align-self: flex-start; display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: rgba(255,45,49,0.12); color: #ff2d31; border-radius: 999px; font-size: 0.95rem; font-weight: 600; letter-spacing: 0.02em; transition: background 0.2s ease; }
					.home-link:hover { background: rgba(255,45,49,0.18); }
					.feed-title { font-size: 2rem; font-weight: 700; margin: 0; }
					.feed-subtitle { max-width: 66ch; color: #5b5354; margin: 0; }
					.timeline { position: relative; margin-top: 2.5rem; padding-left: 2.75rem; }
					.timeline::before { content: ""; position: absolute; left: 1.125rem; top: 0; bottom: 0; width: 2px; background: rgba(255,45,49,0.35); }
					.timeline-item { position: relative; margin-bottom: 2.5rem; padding: 1.75rem 1.75rem 1.5rem; background: #ffffff; border-radius: 1.25rem; box-shadow: 0 24px 40px -28px rgba(255,45,49,0.55); border: 1px solid rgba(255,45,49,0.08); }
					.timeline-item::before { content: ""; position: absolute; left: -2.3rem; top: 2rem; width: 0.9rem; height: 0.9rem; border-radius: 50%; background: #ff2d31; border: 3px solid #ffffff; box-shadow: 0 0 0 4px rgba(255,45,49,0.18); }
					.item-header { display: flex; flex-wrap: wrap; gap: 0.75rem 1.5rem; align-items: center; margin-bottom: 0.75rem; }
					.item-title { font-size: 1.25rem; font-weight: 650; margin: 0; }
					.item-title a { color: inherit; }
					.meta { display: flex; flex-wrap: wrap; gap: 0.75rem; font-size: 0.9rem; color: #6d6667; }
					.badge { display: inline-flex; align-items: center; padding: 0.15rem 0.75rem; background: rgba(255,45,49,0.12); color: #ff2d31; border-radius: 999px; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
					.item-content { margin-top: 1rem; color: #3c3536; }
					.item-content img { max-width: 100%; border-radius: 0.75rem; }
					.item-content pre, .item-content code { font-family: "SFMono-Regular", Menlo, Monaco, "Courier New", monospace; background: rgba(255,45,49,0.08); padding: 0.25rem 0.5rem; border-radius: 0.5rem; overflow-x: auto; }
					footer { margin-top: 3rem; font-size: 0.85rem; color: #80797a; text-align: center; }
					@media (prefers-color-scheme: dark) {
						body { background: #110f10; color: #f4f1f2; }
						.home-link { background: rgba(255,45,49,0.18); color: #ff7a7c; }
						.home-link:hover { background: rgba(255,45,49,0.28); }
						.feed-subtitle { color: #b5adb0; }
						.timeline::before { background: rgba(255,122,124,0.45); }
						.timeline-item { background: #1e1b1c; border-color: rgba(255,122,124,0.18); box-shadow: 0 28px 48px -32px rgba(0,0,0,0.75); }
						.timeline-item::before { border-color: #1e1b1c; box-shadow: 0 0 0 4px rgba(255,45,49,0.24); }
						.meta { color: #d0c7c9; }
						.item-content { color: #e5dee0; }
						.item-content pre, .item-content code { background: rgba(255,45,49,0.22); }
						footer { color: #a19799; }
					}
				]]></style>
			</head>
			<body>
				<div class="page">
					<header class="header">
						<a class="home-link" href="{$home-url}">&#8592; Back to Home</a>
						<h1 class="feed-title">
							<xsl:choose>
								<xsl:when test="string($feedTitle)"><xsl:value-of select="$feedTitle"/></xsl:when>
								<xsl:otherwise>Atom Feed</xsl:otherwise>
							</xsl:choose>
						</h1>
						<xsl:if test="string($feedSub)">
							<p class="feed-subtitle"><xsl:value-of select="$feedSub"/></p>
						</xsl:if>
					</header>
					<main>
						<div class="timeline">
							<xsl:apply-templates select="atom:entry"/>
						</div>
					</main>
					<footer>
						This is styled Atom Feed. Generated by RSSBook.
					</footer>
				</div>
			</body>
		</html>
	</xsl:template>

	<xsl:template match="atom:entry">
		<xsl:variable name="altLink">
			<xsl:choose>
				<xsl:when test="string(atom:link[@rel='alternate'][1]/@href)">
					<xsl:value-of select="atom:link[@rel='alternate'][1]/@href"/>
				</xsl:when>
				<xsl:when test="string(atom:link[not(@rel)][1]/@href)">
					<xsl:value-of select="atom:link[not(@rel)][1]/@href"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="atom:id"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<article class="timeline-item">
			<div class="item-header">
				<h2 class="item-title">
					<xsl:choose>
						<xsl:when test="string($altLink)">
							<a href="{$altLink}"><xsl:value-of select="normalize-space(atom:title)"/></a>
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="normalize-space(atom:title)"/>
						</xsl:otherwise>
					</xsl:choose>
				</h2>
				<div class="meta">
					<xsl:variable name="published">
						<xsl:choose>
							<xsl:when test="string(atom:updated)"><xsl:value-of select="atom:updated"/></xsl:when>
							<xsl:when test="string(atom:published)"><xsl:value-of select="atom:published"/></xsl:when>
							<xsl:otherwise/>
						</xsl:choose>
					</xsl:variable>
					<xsl:if test="string($published)">
						<span>
							<strong>Published:</strong>
							<xsl:text> </xsl:text>
							<xsl:value-of select="$published"/>
						</span>
					</xsl:if>
					<xsl:if test="atom:author/atom:name">
						<span>
							<strong>By:</strong>
							<xsl:text> </xsl:text>
							<xsl:value-of select="normalize-space(atom:author/atom:name)"/>
						</span>
					</xsl:if>
				</div>
			</div>
			<xsl:if test="atom:category">
				<div class="meta">
					<xsl:for-each select="atom:category">
						<span class="badge">
							<xsl:choose>
								<xsl:when test="string(@label)"><xsl:value-of select="normalize-space(@label)"/></xsl:when>
								<xsl:when test="string(@term)"><xsl:value-of select="normalize-space(@term)"/></xsl:when>
								<xsl:otherwise><xsl:value-of select="position()"/></xsl:otherwise>
							</xsl:choose>
						</span>
					</xsl:for-each>
				</div>
			</xsl:if>
			<xsl:if test="atom:content or atom:summary">
				<div class="item-content">
					<xsl:choose>
						<xsl:when test="atom:content[@type='xhtml']">
							<xsl:copy-of select="atom:content/*"/>
						</xsl:when>
						<xsl:when test="atom:content[@type='html' or @type='text/html']">
							<xsl:value-of select="atom:content" disable-output-escaping="yes"/>
						</xsl:when>
						<xsl:when test="atom:content">
							<p><xsl:value-of select="atom:content"/></p>
						</xsl:when>
						<xsl:when test="atom:summary[@type='xhtml']">
							<xsl:copy-of select="atom:summary/*"/>
						</xsl:when>
						<xsl:when test="atom:summary[@type='html' or @type='text/html']">
							<xsl:value-of select="atom:summary" disable-output-escaping="yes"/>
						</xsl:when>
						<xsl:otherwise>
							<p><xsl:value-of select="atom:summary"/></p>
						</xsl:otherwise>
					</xsl:choose>
				</div>
			</xsl:if>
		</article>
	</xsl:template>
</xsl:stylesheet>