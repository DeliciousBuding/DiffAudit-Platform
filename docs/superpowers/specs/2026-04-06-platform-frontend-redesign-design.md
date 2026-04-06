# DiffAudit Platform Frontend Redesign Design

## Goal

Rebuild the `apps/web` frontend of `DiffAudit-Platform` so that its design system, layout skeleton, and page composition closely follow the `codex2api` frontend.

This is a full-shell redesign, not a cosmetic patch.

## User-Confirmed Direction

- use full layout and visual language migration from `codex2api`
- keep only minimal brand replacement for `DiffAudit`
- redesign all current frontend pages, not only the login page
- add real light and dark theme support
- do not preserve the current `Platform` visual system

## Scope

In scope:

- `apps/web` global styles and theme tokens
- desktop sidebar, mobile topbar, mobile bottom navigation
- page header pattern, state containers, cards, forms, lists, badges
- `/login`
- `/dashboard`
- `/audit`
- `/guide`
- `/report`
- `/batch`

Out of scope:

- `apps/api` behavior changes
- auth flow behavior changes
- route protection changes in `src/proxy.ts`
- research repo integration logic
- new backend features

## Hard Constraints

- keep Next.js App Router structure
- keep existing route paths unchanged
- keep login and logout API handlers unchanged unless a UI issue forces a minimal adjustment
- keep protected route behavior unchanged
- do not import the `codex2api` codebase directly; adapt the design into this repo's structure
- use the shortest path to a coherent full-site redesign

## Source Design System to Mirror

The migration should follow the design behavior of `codex2api` frontend in these dimensions:

- dual theme token system with light theme as first-class, not dark-only overrides
- application shell centered on a persistent desktop sidebar
- mobile layout with compact topbar and fixed bottom navigation
- unified page headers with title, description, and action slot
- reusable cards and state shells for loading, error, and empty states
- muted layered backgrounds, soft borders, soft gradients, and restrained elevation
- consistent form styling for inputs, buttons, labels, errors, and focus states

## Architecture Plan

### 1. Global Theme Layer

Replace the current `apps/web/src/app/globals.css` token set with a light/dark token model inspired by `codex2api`.

This layer should define:

- semantic background, foreground, card, border, input, muted, primary, accent, destructive tokens
- light theme defaults on `:root`
- dark theme overrides under `.dark`
- body background treatment for both themes
- shared animation helpers and loading spinner styles

Theme switching should be implemented at the frontend shell level so the whole app responds consistently.

### 2. Shell Layer

Replace the current `PlatformShell` with a shell that mirrors the `codex2api` information architecture:

- left sidebar on desktop
- top controls for theme toggle and session actions
- mobile topbar
- mobile bottom navigation
- brand block adapted from `codex2api` but renamed to `DiffAudit`

The shell should remain route-driven and use the existing navigation config as the source of truth.

### 3. Reusable UI Layer

Introduce a minimal internal component layer for shared styling so page code no longer hardcodes one-off glass blocks.

Required shared primitives:

- page header
- stat card
- state shell for loading, error, and empty states
- section card
- status badge
- theme toggle

This layer exists to make the full migration coherent and keep later page work stable.

### 4. Page Migration Layer

Each current route should be rewritten into the new shell and component system:

#### `/login`

- use the new theme system
- align spacing, card treatment, input styling, and error state with the migrated design system
- keep shared-login behavior unchanged

#### `/dashboard`

- convert to summary cards plus structured status sections
- present current platform and experiment state in the new card grammar

#### `/audit`

- keep it as the primary action page
- use page header, primary form area, method badges, and side context cards

#### `/guide`

- convert to a structured guide page using section cards and ordered progress steps

#### `/report`

- convert to a structured summary page with result cards and report sections

#### `/batch`

- convert to an operations-style queue page with unified list item styling

## Data and Behavior Rules

- static placeholder data can remain for now where current pages already use placeholders
- no new backend contracts should be invented during the redesign
- page content may be reorganized for presentation, but not expanded into new business workflows

## Risks

### Framework mismatch

`codex2api` uses Vite with React Router, while this repo uses Next.js App Router. The migration must copy design structure and styling patterns, not file layout or router assumptions.

### Missing component base

`Platform` currently lacks a reusable component layer, so the redesign must create the minimum necessary shared components before page rewrites.

### Scope size

This is a full-surface frontend refactor. The shortest safe path is:

1. theme and shell first
2. shared UI primitives second
3. route pages third
4. lint, build, and browser verification last

## Verification Standard

The redesign is complete only if all of the following are true:

- all current frontend routes render inside the new shell
- light theme and dark theme both work across login and protected pages
- mobile and desktop navigation both exist and are usable
- login flow still works
- protected-route behavior remains unchanged
- `npm --prefix apps/web run lint` passes
- `npm --prefix apps/web run build` passes
- manual browser verification confirms visual consistency on core routes

## Non-Goals

- do not build a full component library beyond what this redesign needs
- do not redesign backend API semantics
- do not connect real audit execution during this pass
- do not add portal-style multi-user auth
