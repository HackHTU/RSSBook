import type { Theme } from "@/types";
import { galleryTheme } from "./gallery";
import { magazineTheme } from "./magazine";
import { masonryTheme } from "./masonry";
import { minimalTheme } from "./minimal";
import { readerTheme } from "./reader";
import { redbookTheme } from "./redbook";

export const DEFAULT_THEME = redbookTheme;

export const THEMES: Record<string, Theme> = {
	gallery: galleryTheme,
	magazine: magazineTheme,
	masonry: masonryTheme,
	minimal: minimalTheme,
	reader: readerTheme,
	redbook: redbookTheme,
};

export type ThemeName = keyof typeof THEMES;

export function getThemeByName(name: ThemeName): Theme {
	return THEMES[name] ?? DEFAULT_THEME;
}
