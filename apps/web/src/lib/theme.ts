export type ThemeMode = "light" | "dark" | "system";
export type EffectiveTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "diffaudit-theme";
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

export function getEffectiveTheme(
  mode: ThemeMode,
  prefersDark: boolean,
): EffectiveTheme {
  if (mode === "system") {
    return prefersDark ? "dark" : "light";
  }

  return mode;
}

export function getThemeLabel(mode: ThemeMode): string {
  if (mode === "light") {
    return "浅色";
  }

  if (mode === "dark") {
    return "深色";
  }

  return "跟随系统";
}

export function getThemeBootScript(
  storageKey = THEME_STORAGE_KEY,
  fallback: ThemeMode = DEFAULT_THEME,
): string {
  return `(() => {
    const root = document.documentElement;
    const systemQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const resolveEffectiveTheme = (themeMode) => {
      if (themeMode === "system") {
        return systemQuery.matches ? "dark" : "light";
      }

      return themeMode === "dark" ? "dark" : "light";
    };
    const apply = (themeMode) => {
      const effectiveTheme = resolveEffectiveTheme(themeMode);
      root.dataset.themeMode = themeMode;
      root.dataset.theme = effectiveTheme;
      root.style.colorScheme = effectiveTheme;
      root.classList.toggle("dark", effectiveTheme === "dark");
    };

    try {
      const stored = window.localStorage.getItem("${storageKey}");
      const themeMode = stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : "${fallback}";
      apply(themeMode);
      systemQuery.addEventListener("change", () => {
        if ((root.dataset.themeMode || "${fallback}") === "system") {
          apply("system");
        }
      });
    } catch (error) {
      apply("${fallback}");
    }
  })();`;
}
