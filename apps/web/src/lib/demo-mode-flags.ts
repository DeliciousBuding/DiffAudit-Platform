const ENABLED_VALUES = new Set(["1", "true", "yes", "on", "demo"]);
const DISABLED_VALUES = new Set(["0", "false", "no", "off"]);

type DemoModeEnv = Record<string, string | undefined>;

function normalizeFlag(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export function parseDemoModeFlag(value: string | undefined): boolean | undefined {
  const normalized = normalizeFlag(value);

  if (ENABLED_VALUES.has(normalized)) return true;
  if (DISABLED_VALUES.has(normalized)) return false;
  return undefined;
}

export function readDemoModeEnv(env: DemoModeEnv = process.env): boolean | undefined {
  if (parseDemoModeFlag(env.DIFFAUDIT_FORCE_DEMO_MODE) === true) {
    return true;
  }

  return parseDemoModeFlag(env.DIFFAUDIT_DEMO_MODE);
}

export function isDemoModeEnvConfigured(env: DemoModeEnv = process.env): boolean {
  return (
    parseDemoModeFlag(env.DIFFAUDIT_FORCE_DEMO_MODE) === true
    || parseDemoModeFlag(env.DIFFAUDIT_DEMO_MODE) !== undefined
  );
}
