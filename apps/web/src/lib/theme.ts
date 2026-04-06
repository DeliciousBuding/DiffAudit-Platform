export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "diffaudit-theme";
export const DEFAULT_THEME: ThemeMode = "light";

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark";
}

export function resolveThemeMode(
  value: unknown,
  fallback: ThemeMode = DEFAULT_THEME,
): ThemeMode {
  return isThemeMode(value) ? value : fallback;
}

export function themeClassName(theme: ThemeMode): string {
  return theme === "dark" ? "dark" : "";
}

export function getThemeBootScript(
  storageKey = THEME_STORAGE_KEY,
  fallback: ThemeMode = DEFAULT_THEME,
): string {
  return `(() => {
    const root = document.documentElement;
    const apply = (theme) => {
      root.dataset.theme = theme;
      root.style.colorScheme = theme;
      root.classList.toggle("dark", theme === "dark");
    };

    try {
      const stored = window.localStorage.getItem("${storageKey}");
      const theme = stored === "light" || stored === "dark" ? stored : "${fallback}";
      apply(theme);
    } catch (error) {
      apply("${fallback}");
    }
  })();`;
}
