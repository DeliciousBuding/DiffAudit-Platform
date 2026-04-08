import fs from "node:fs";
import path from "node:path";

import type { NextConfig } from "next";

export function resolveTurbopackRoot(startDir: string): string {
  let currentDir = startDir;
  const filesystemRoot = path.parse(startDir).root;

  while (true) {
    const nextPackagePath = path.join(currentDir, "node_modules", "next", "package.json");
    const packageLockPath = path.join(currentDir, "package-lock.json");

    if (fs.existsSync(nextPackagePath) && fs.existsSync(packageLockPath)) {
      return currentDir;
    }

    if (currentDir === filesystemRoot) {
      return path.resolve(startDir, "../..");
    }

    currentDir = path.dirname(currentDir);
  }
}

const nextConfig: NextConfig = {
  turbopack: {
    root: resolveTurbopackRoot(__dirname),
  },
};

export default nextConfig;
