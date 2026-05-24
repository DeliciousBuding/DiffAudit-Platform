import { describe, expect, it } from "vitest";

import { isDemoModeEnvConfigured, parseDemoModeFlag, readDemoModeEnv } from "./demo-mode-flags";

describe("demo mode environment flags", () => {
  it.each(["1", "true", "yes", "on", "demo", " TRUE "])(
    "parses %s as enabling demo mode",
    (value) => {
      expect(parseDemoModeFlag(value)).toBe(true);
    },
  );

  it.each(["0", "false", "no", "off", " OFF "])(
    "parses %s as disabling demo mode",
    (value) => {
      expect(parseDemoModeFlag(value)).toBe(false);
    },
  );

  it("leaves unset or unknown values to cookie/default behavior", () => {
    expect(parseDemoModeFlag(undefined)).toBeUndefined();
    expect(parseDemoModeFlag("")).toBeUndefined();
    expect(parseDemoModeFlag("maybe")).toBeUndefined();
  });

  it("lets DIFFAUDIT_FORCE_DEMO_MODE force-enable ahead of DIFFAUDIT_DEMO_MODE=0", () => {
    expect(readDemoModeEnv({
      DIFFAUDIT_FORCE_DEMO_MODE: "1",
      DIFFAUDIT_DEMO_MODE: "0",
    })).toBe(true);
  });

  it("treats DIFFAUDIT_DEMO_MODE=false/no/off as explicit live mode", () => {
    for (const value of ["false", "no", "off"]) {
      expect(readDemoModeEnv({ DIFFAUDIT_DEMO_MODE: value })).toBe(false);
      expect(isDemoModeEnvConfigured({ DIFFAUDIT_DEMO_MODE: value })).toBe(true);
    }
  });
});
