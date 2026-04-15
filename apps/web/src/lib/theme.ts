export type ThemeMode = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "theme";
export const DEFAULT_THEME: ThemeMode = "system";

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

export function resolveThemeMode(
  value: unknown,
  fallback: ThemeMode = DEFAULT_THEME,
): ThemeMode {
  return isThemeMode(value) ? value : fallback;
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
      let resolved;
      if (stored === "light" || stored === "dark") {
        resolved = stored;
      } else if (stored === "system" || !stored) {
        resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      } else {
        resolved = "${fallback}" === "system"
          ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
          : "${fallback}";
      }
      apply(resolved);
    } catch (error) {
      const fallbackResolved = "${fallback}" === "system"
        ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : "${fallback}";
      apply(fallbackResolved);
    }
  })();`;
}
