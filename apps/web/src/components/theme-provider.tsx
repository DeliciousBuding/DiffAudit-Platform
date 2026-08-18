"use client";

import type * as React from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

/**
 * ThemeProvider — client wrapper around next-themes' provider.
 *
 * Two TS rough edges with next-themes 0.4.x under React 19 are smoothed here:
 *   1. Its provider is declared `(props) => React.JSX.Element`, which React 19's
 *      JSX typing doesn't accept as a component — casting to `React.FC` restores
 *      a recognised signature.
 *   2. `ThemeProviderProps extends React.PropsWithChildren` (a type alias built
 *      on `unknown & …`), which under `interface extends` does NOT inherit
 *      `children`. We re-add `children` explicitly.
 *
 * Net effect: a normally-typed client component the (server) root layout can
 * render, with full prop checking.
 */
type ThemeProviderClientProps = ThemeProviderProps & {
  children?: React.ReactNode;
};

const Provider = NextThemesProvider as unknown as React.FC<ThemeProviderClientProps>;

export function ThemeProvider({ children, ...props }: ThemeProviderClientProps) {
  return <Provider {...props}>{children}</Provider>;
}

export type { ThemeProviderProps };
