import type { Language } from "@/types";

export type Translations = {
	search: string;
	home: string;
	toggleDarkMode: string;
	menu: string;
	searchArticles: string;
	enterKeywords: string;
	filterByCategory: string;
	all: string;
	currentFilter: string;
	clearFilter: string;
	closeFilterBar: string;
	noContent: string;
	pageContentDisplayed: string;
	unknownDate: string;
	mediaAttachment: string;
	duration: string;
	play: string;
	loaded: string;
	articlesOfTotal: string;
	page: string;
	of: string;
	total: string;
	pages: string;
	previousPage: string;
	nextPage: string;
	quickNavigation: string;
	allRightsReserved: string;
	proudlyMadeWith: string;
	searchResultsFor: string;
	filteredByCategory: string;
	clearAll: string;
	readMore: string;
};

const zhCN: Translations = {
	all: "全部",
	allRightsReserved: "保留所有权利.",
	articlesOfTotal: "篇文章 / 共 {total} 篇",
	clearAll: "清除全部",
	clearFilter: "清除筛选",
	closeFilterBar: "关闭筛选栏",
	currentFilter: "当前筛选:",
	duration: "时长:",
	enterKeywords: "输入关键词...",
	filterByCategory: "按分类筛选",
	filteredByCategory: "分类筛选:",
	home: "首页",
	loaded: "已加载",
	mediaAttachment: "媒体附件",
	menu: "菜单",
	nextPage: "下一页",
	noContent: "暂无内容",
	of: "共",
	page: "第",
	pageContentDisplayed: "当前页内容已展示完毕",
	pages: "页",
	play: "播放",
	previousPage: "上一页",
	proudlyMadeWith: "自豪地采用 RSSBook 制作。",
	quickNavigation: "快速导航",
	readMore: "阅读更多",
	search: "搜索",
	searchArticles: "搜索文章",
	searchResultsFor: "搜索:",
	toggleDarkMode: "切换暗色模式",
	total: "页",
	unknownDate: "未知日期",
};

const en: Translations = {
	all: "All",
	allRightsReserved: "All rights reserved.",
	articlesOfTotal: "articles / {total} total",
	clearAll: "Clear all",
	clearFilter: "Clear filter",
	closeFilterBar: "Close filter bar",
	currentFilter: "Current filter:",
	duration: "Duration:",
	enterKeywords: "Enter keywords...",
	filterByCategory: "Filter by category",
	filteredByCategory: "Category:",
	home: "Home",
	loaded: "Loaded",
	mediaAttachment: "Media attachment",
	menu: "Menu",
	nextPage: "Next page",
	noContent: "No content",
	of: "of",
	page: "Page",
	pageContentDisplayed: "Current page content fully displayed",
	pages: "",
	play: "Play",
	previousPage: "Previous page",
	proudlyMadeWith: "Proudly made with RSSBook.",
	quickNavigation: "Quick Navigation",
	readMore: "Read more",
	search: "Search",
	searchArticles: "Search articles",
	searchResultsFor: "Search:",
	toggleDarkMode: "Toggle dark mode",
	total: "",
	unknownDate: "Unknown date",
};

const translations: Record<string, Translations> = {
	en: en,
	"en-GB": en,
	"en-US": en,
	zh: zhCN,
	"zh-CN": zhCN,
};

export function getTranslations(lang?: Language | string): Translations {
	if (!lang) {
		return zhCN;
	}

	const normalizedLang = lang.toLowerCase();

	if (translations[normalizedLang]) {
		return translations[normalizedLang];
	}

	const primary = normalizedLang.split("-")[0];
	if (translations[primary]) {
		return translations[primary];
	}

	return zhCN;
}
