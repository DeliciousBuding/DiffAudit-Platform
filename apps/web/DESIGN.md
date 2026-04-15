# DiffAudit Design System

Reference:
- `Docs/FrontEndSaSS/IMAGE_DESCRIPTIONS.md`
- `src/app/globals.css`
- `src/lib/workspace-copy.ts`

This document is the single design contract for the DiffAudit web frontend.

It defines four things:

1. Visual direction
2. Product design anchors
3. Structural page grammar
4. Tokens, components, and implementation hooks

It should be read as a product-facing workspace design spec, not as a generic UI style guide.

## 1. Product Positioning

DiffAudit is not a marketing site disguised as a dashboard.

It is a local audit workspace for privacy-risk analysis of diffusion models. The frontend must therefore feel like:

- an operator console
- a research evidence surface
- a report preparation tool
- a guided audit workflow

The UI should always make the current system state legible:

- what is being audited
- what has already been evaluated
- what is risky
- what is missing
- what the operator should do next

## 2. Product Design Anchors

These anchors define how every page should feel and what each page should optimize for.

### 2.1 Audit-First, Not Marketing-First

Workspace pages exist to help users run audits, inspect results, and export evidence.

They should prioritize:

- task state
- metric readability
- table-driven comparison
- interpretation of risk
- next-step clarity

They should not prioritize:

- decorative storytelling
- oversized hero blocks
- oversized empty whitespace
- card grids where data tables are more efficient

### 2.2 Evidence-First

Raw numbers are not enough. Every key metric should be close to its interpretation.

The frontend should consistently help users answer:

- is this result risky
- why is it risky
- what evidence supports the claim
- how does this compare to another attack, defense, or track

### 2.3 One Page, One Primary Decision

Each page should have a dominant user decision.

Examples:

- Workspace home: understand current state
- Audits: create or monitor jobs
- Reports: interpret and export results
- Settings: configure defaults and operating environment
- Error pages: recover and return to the main path

If a page does too many unrelated things, the design should be decomposed rather than expanded.

### 2.4 Dense, Calm, and Legible

The product should feel information-dense without feeling crowded.

The correct mood is:

- calm
- clinical
- precise
- lightweight
- modern SaaS

The wrong mood is:

- playful
- noisy
- overly futuristic
- over-animated
- glassmorphism-heavy
- enterprise-gray and lifeless

### 2.5 Metrics Must Become Meaning

DiffAudit does not stop at showing `AUC`, `ASR`, and `TPR`.

The design should progressively convert metrics into:

- risk level
- evidence confidence
- comparison signals
- recommended follow-up

## 3. Visual Direction

The visual anchor is the light SaaS backend language captured in `Docs/FrontEndSaSS`.

### 3.1 Core Visual Identity

- light background
- cool neutral surfaces
- strong brand blue as the main action and selection color
- restrained use of coral/red, amber, and green for system meaning
- rounded geometry
- thin borders
- large but controlled whitespace
- compact typography

### 3.2 Brand Feel

DiffAudit should look like a serious technical product, but not like an internal admin relic.

The design should communicate:

- modernity
- trust
- technical precision
- controlled emphasis

The design should avoid:

- heavy gradients as default content backgrounds
- full-page illustration-led layouts inside workspace pages
- black-heavy UI
- excessive shadows
- neon security-dashboard clichés

### 3.3 Surface Strategy

There are three main surface levels:

1. Page background
2. Content container
3. Emphasis surface

Their relationship should be stable:

- page background is the quietest layer
- content containers carry the majority of information
- emphasis surfaces are used sparingly for key actions, key summaries, or alerts

### 3.4 Emphasis Strategy

Use visual emphasis in this order:

1. layout position
2. typography contrast
3. color
4. iconography
5. motion

Color should not be the only way a block communicates importance.

## 4. Visual Design Anchors From FrontEndSaSS

The FrontEndSaSS references define the desired family resemblance.

### 4.1 Anchor Screens

Primary anchors:

- `dashboard-overview-home.png`
- `dashboard-member-management-table.png`
- `dashboard-payment-orders-table.png`
- `design-system-form-controls.png`
- `design-system-color-tokens.png`
- `design-system-typography-scale.png`
- `design-system-component-library.png`

Secondary anchors:

- `workspace-chat-collaboration.png`
- `error-page-403-forbidden.png`
- `error-page-404-not-found.png`

### 4.2 What To Reuse From The References

- left sidebar + top utility bar shell
- compact KPI rows
- table-centric data regions
- soft neutral cards with blue emphasis
- status dots and compact badges
- clean tabs and pagers
- rounded button/input language
- quiet error pages with illustration support

### 4.3 What To Adapt For DiffAudit

The references are generic SaaS admin examples. DiffAudit should adapt them into audit semantics.

Map them as follows:

- member management table -> audit job list / experiment list
- payment details table -> result detail / evaluation ledger
- sales ranking -> attack, defense, or model ranking
- welcome banner -> workspace summary and guidance
- meetings/chat -> collaboration and evidence discussion
- status dots -> runtime, queue, and risk states

## 5. Product Structure

The product has five stable frontend layers.

### 5.1 Layer A: Global Shell

Persistent frame used by workspace pages:

- sidebar
- topbar
- main content area

This layer carries navigation, identity, language, runtime state, and sign-out actions.

### 5.2 Layer B: Page Header

Every workspace page begins with a page header.

The header contains:

- eyebrow
- title
- one-sentence description
- optional page-level primary action

The header should tell the user what this page is for before showing data.

### 5.3 Layer C: Summary Band

If the page has summary metrics, they appear immediately below the header.

This band is used for:

- KPI cards
- key counts
- quick health signals
- top-level risk summary

### 5.4 Layer D: Primary Work Surface

This is the page's main functional region.

Examples:

- result table
- job creation area
- report interpretation area
- settings forms

This layer owns the main decision of the page.

### 5.5 Layer E: Utility Surface

Secondary but useful information sits beside or below the primary work surface.

Examples:

- task checklist
- running jobs
- coverage gaps
- export actions
- audit notes
- recent activity

Utility surfaces support the page. They do not compete with it.

## 6. Page Templates

All current and future pages should inherit one of these templates.

### 6.1 Overview Page Template

Used for:

- `/workspace`
- future team or project home pages

Composition:

- page header
- KPI row
- main data region
- one supporting utility region

Recommended structure:

```text
Header
KPI Row
Main Grid
  Left: recent results / ranked evidence / key table
  Right: tasks / runtime / guidance / summary
```

Purpose:

- establish current operational state
- expose the most important results quickly
- show what to do next

### 6.2 List-and-Operate Template

Used for:

- `/workspace/audits`
- future jobs, datasets, or experiment indexes

Composition:

- page header with primary CTA
- optional filter/toolbar row
- one dominant table
- one secondary panel for live state, recommendations, or recent activity

Purpose:

- take action from the list
- compare many rows efficiently
- reduce navigation hops for common operations

### 6.3 Report-and-Interpret Template

Used for:

- `/workspace/reports`
- future report detail pages

Composition:

- page header with export action
- audit result table
- risk interpretation blocks
- coverage gaps or recommendation blocks

Purpose:

- turn result rows into findings
- prepare evidence for export or presentation
- surface missing coverage

### 6.4 Settings-and-Config Template

Used for:

- `/workspace/settings`

Composition:

- page header
- grouped config sections
- system status block
- account / workspace defaults block

Purpose:

- make operational configuration clear and low-friction
- avoid long unstructured forms

### 6.5 Recovery Template

Used for:

- not found
- forbidden
- global error

Composition:

- centered error code or icon
- short explanation
- one recovery action
- optional secondary action

Purpose:

- keep users inside the product frame
- reduce error anxiety
- return users to the main path immediately

## 7. Structural Design Rules

### 7.1 Layout Hierarchy

The layout hierarchy should always read in this order:

1. page identity
2. current state
3. main action region
4. supporting detail

If a page reads in another order, the layout is wrong.

### 7.2 Information Rhythm

Use a repeating rhythm:

- identify
- summarize
- inspect
- act

This rhythm should appear inside pages and inside individual cards.

### 7.3 Primary vs Secondary Regions

Every page must clearly separate:

- the region where the main task happens
- the region that supports the main task

Do not present multiple regions with equal visual weight unless they are truly equal in importance.

### 7.4 Section Construction

Most content sections should follow this anatomy:

- section shell
- section header
- section body
- optional section footer

This structure should repeat across cards, tables, panels, and report modules.

### 7.5 Table Priority

When the user needs to compare many rows, tables are the default.

Replace tables with cards only when:

- each item needs custom narrative layout
- the dataset is very small
- comparison is not the primary task

### 7.6 Side Panels

Right-side or lower utility panels are appropriate for:

- todo steps
- runtime status
- interpretive summaries
- export actions
- help content

They are not appropriate for duplicating the main table or repeating the same metrics.

## 8. Product Design Anchors By Page

### 8.1 Workspace Home

The home page should answer four questions in one screen:

- how much audit data do we have
- what results are most relevant now
- what is the current system/runtime state
- what should the operator do next

The page should feel like a calm command desk, not a report dump.

### 8.2 Audits

The audits page should feel operational.

Its dominant behaviors are:

- create job
- inspect queue
- review newest runs
- compare recommended contracts

The page should feel “ready to act,” not “ready to read.”

### 8.3 Reports

The reports page should feel interpretive.

Its dominant behaviors are:

- inspect evidence rows
- understand risk level
- identify missing coverage
- export a summary

The page should feel more analytical than operational.

### 8.4 Settings

The settings page should feel controlled and boring in a good way.

Its dominant behaviors are:

- confirm runtime state
- adjust defaults
- manage team/account context

Settings must never look experimental or overloaded.

## 9. Risk Presentation Contract

Risk presentation is a product-level concern, not a local component decision.

### 9.1 Risk Output Levels

Every major result surface should make room for:

- raw metric values
- risk level
- short interpretation
- evidence strength or confidence

### 9.2 Risk Color Semantics

Use these meanings consistently:

- Coral / red: clearly risky, failing, or high-priority negative state
- Amber: caution, medium risk, incomplete, in progress, or ambiguous evidence
- Blue: default information, selected state, neutral emphasis, or tracked item
- Green: healthy, completed, low risk, or validated
- Gray: inactive, unavailable, unknown, or secondary information

### 9.3 Risk Threshold Usage

The current thresholds are:

| Risk | Condition | Color | Background |
|------|-----------|-------|------------|
| High | AUC > 0.85 | `--accent-coral` / `#ff5f46` | `rgba(255,95,70,0.12)` |
| Medium | `0.65 <= AUC <= 0.85` | `--warning` / `#b67619` | `rgba(182,118,25,0.12)` |
| Low | AUC < 0.65 | `--success` / `#157a52` | `rgba(21,122,82,0.12)` |

These thresholds are the default classification rule for UI grouping and first-pass color coding.

Where a page also shows `ASR` and `TPR`, the UI should still expose those values directly rather than hiding them behind the AUC label.

### 9.4 Risk Communication Pattern

Whenever possible, use this pattern:

```text
Metric -> Risk label -> Short interpretation -> Follow-up action
```

Examples:

- `AUC 0.874 -> High risk -> Member signal remains strong -> Review defense comparison`
- `AUC 0.489 -> Low risk -> Attack is near random guessing -> Safe to deprioritize`

## 10. Visual Token System

## 10.1 Color Tokens

### Brand & Neutral

| Token | Value | Usage |
|-------|-------|-------|
| `--accent-blue` | `#2f6df6` | Primary action color, active states, links, selected items |
| `--accent-coral` | `#ff5f46` | High risk, destructive emphasis, negative outcomes |
| `--palette-grey-0` | `#ffffff` | Page background |
| `--palette-grey-10` | `#f8f9fc` | Hover background, section fills |
| `--palette-grey-20` | `#eff2f7` | Active or pressed background |
| `--palette-grey-50` | `#e6eaf0` | Disabled fills, dividers |
| `--palette-grey-800` | `#45474d` | Secondary text |
| `--palette-grey-900` | `#2f3034` | Strong secondary emphasis, dark supporting controls |
| `--palette-grey-1200` | `#121317` | Primary text, dense neutral action |

### Semantic / Status

| Token | Value | Usage |
|-------|-------|-------|
| `--success` | `#157a52` | Connected, completed, low risk |
| `--success-soft` | `rgba(21,122,82,0.12)` | Success background tint |
| `--warning` | `#b67619` | In progress, medium risk |
| `--warning-soft` | `rgba(182,118,25,0.12)` | Warning background tint |
| `--info` | `#2f6df6` | Informational, selected, default badge |
| `--info-soft` | `rgba(47,109,246,0.12)` | Info background tint |
| `--border` | `rgba(33,34,38,0.12)` | All borders, dividers |

### Token Intent

There are two different “strong” colors in the system:

- blue is the primary product action
- near-black is a dense neutral emphasis

Do not confuse them.

Use blue for:

- create
- continue
- confirm
- export
- selected navigation
- active filters

Use near-black for:

- dense neutral utility buttons
- compact shell accents
- non-destructive supporting actions where blue would over-signal

## 10.2 Typography Scale

Font stack:

- UI: `"Google Sans Flex", sans-serif`
- Data: `"Google Sans Code", monospace`

| Level | Size | Weight | Line-height | Usage |
|-------|------|--------|-------------|-------|
| Page title | `18px` | 600 | 1.3 | `h1` in workspace pages |
| Section heading | `10px uppercase` | 600 | 1.3 | Section headers, eyebrow |
| Table header | `11px uppercase` | 500 | 1.3 | `thead th` |
| Body / table cell | `12-13px` | 400/500 | 1.4 | `td`, labels, descriptions |
| KPI value | `24px` | 600 | 1 | Large numbers in KPI cards |
| Mono data | `13px` | 400 | 1.4 | AUC, ASR, TPR, ids |
| Caption | `10px` | 400 | 1.5 | Notes, hints, descriptions |

Typography should stay compact. New sizes should be avoided unless a new page type truly requires them.

## 10.3 Layout Grid

### Workspace Layout

```text
+--sidebar (224px fixed)--+--main-area (flex:1, max 1400px)--+
|                          |                                   |
| BrandMark (header)       | Topbar (language/github/auth)     |
| Nav items (body)         | +-------------------------------+ |
| Runtime status (footer)  | | Main content (padding 24px)   | |
|                          | +-------------------------------+ |
+--------------------------+-----------------------------------+
```

- Sidebar: fixed rail, identity + navigation + runtime footer
- Topbar: utility strip, not a second navigation tier
- Content: bounded workspace surface with consistent padding

### Content Grid

- KPI row: `grid gap-3 grid-cols-2 lg:grid-cols-4`
- Main content: `grid gap-3 lg:grid-cols-3`
- Common split: `2/3 + 1/3`
- Cards: `border border-border bg-card`

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | `4px` | Tight gaps, inline spacing |
| `sm` | `8px` | Compact padding, icon gaps |
| `md` | `12-16px` | Standard padding, section gaps |
| `lg` | `24px` | Page padding, major gaps |
| `xl` | `32-48px` | Page-level breathing room |

## 11. Component Patterns

### 11.1 Cards

Base section card:

```text
border border-border bg-card
  Section header: border-b border-border bg-muted/20 px-3 py-2
  Section body: p-3
```

Cards are structural, not decorative. Their job is to group data and keep rhythm consistent.

### 11.2 KPI Cards

```text
border border-border bg-card p-3
  Label: text-[10px] uppercase
  Value: text-2xl font-semibold
  Note: text-[10px] muted
```

KPI cards should not contain long explanations. They summarize, then hand off to larger panels.

### 11.3 Tables

```text
table.w-full.border-collapse.text-xs
  thead.sticky.top-0.bg-muted/30
  tbody with alternating row tint
  row hover with blue accent bar
```

Table rules:

- header row stays visually lighter than content
- row hover is subtle, never loud
- numeric values should use mono
- actions should be compact and right-aligned

### 11.4 Status Badges

Compact inline badge:

```text
inline-flex items-center gap-1 rounded
```

Badge roles:

- track label
- runtime status
- risk level
- evidence level

Badges are for compact classification, not long explanation.

### 11.5 Buttons

| Variant | Meaning | Style |
|---------|---------|-------|
| Primary | Main action on the page | Blue fill, white text |
| Secondary | Supporting action | Light surface, border |
| Neutral Solid | Dense utility emphasis | Dark fill, white text |
| Destructive | Dangerous or negative action | Coral/red emphasis |
| Text | Lightweight inline action | No heavy chrome |
| Toggle | Binary state action | Rounded pill |

Shared button behavior:

- rounded geometry
- compact vertical size
- one dominant CTA per local region
- no multiple blue primaries fighting in the same band

### 11.6 Form Controls

The form control family includes:

- text input
- search input
- select
- textarea
- checkbox
- toggle

Form fields should feel light and precise:

- soft border
- rounded corners
- strong focus/active definition
- compact padding

### 11.7 Tabs and Filters

Tabs and filter bars are appropriate for:

- switching result subsets
- toggling report slices
- changing list views

Use tabs when the underlying page context remains the same.

Use navigation when the user is moving to a different working area.

### 11.8 Ranking and Trend Blocks

These blocks are part of the design system even if not yet fully implemented.

Use them for:

- attack ranking
- defense ranking
- risky contract ranking
- trend over time
- runtime throughput

Their visual style should follow the reference dashboard:

- minimal axes and chart chrome
- strong data contrast
- compact labels
- nearby summary number

### 11.9 Utility Blocks

Utility blocks include:

- todo list
- runtime status panel
- guidance panel
- export summary block
- coverage gap block

These blocks should stay narrow and lightweight. They support the page rather than dominate it.

### 11.10 Error and Empty States

Empty and recovery states should stay within the product shell whenever possible.

Preferred anatomy:

- code or state icon
- short explanation
- one recovery action

Tone:

- calm
- direct
- not comedic
- not alarming

## 12. Motion and State Feel

Motion should only reinforce clarity.

Allowed feeling:

- crisp
- short
- quiet

Not allowed:

- floaty
- elastic
- theatrical
- decorative page transitions

Current interaction language:

- slight hover lift
- subtle row highlight
- soft focus ring
- skeleton pulse for loading

## 13. Loading and Async Surfaces

Loading is part of the design system, not an implementation afterthought.

The product should prefer:

- local skeletons inside cards and tables
- stable layouts while data loads
- visible placeholders that preserve final structure

The UI should avoid:

- large layout jumps
- blank white regions with no structure
- spinners as the primary loading language for full sections

## 14. Copy and Language Tone

The product uses bilingual copy through `workspace-copy.ts`.

Tone should be:

- concise
- operational
- professional
- mildly explanatory

Avoid:

- hype language
- marketing slogans inside workspace pages
- vague labels like "Overview data" or "Analysis module"

Good labels describe intent:

- `Recent results`
- `Coverage gaps`
- `Create job`
- `Runtime connected`

## 15. Do and Don't

### Do

- use tables for comparison-heavy data
- place interpretation close to metrics
- use blue for the dominant page action
- keep information density high but organized
- let headers explain page purpose
- keep card anatomy consistent across pages
- treat risk presentation as a first-class visual concept

### Don't

- don't import marketing hero patterns into workspace pages
- don't use multiple competing primary CTAs in one section
- don't hide key metrics behind decorative chart cards
- don't invent one-off panel shapes or corner radii
- don't use coral as a general accent color
- don't let utility panels overpower the main work surface
- don't add new visual languages page by page

## 16. File Map

| File | Purpose |
|------|---------|
| `src/app/globals.css` | tokens, layout classes, global component styling |
| `src/lib/workspace-copy.ts` | user-facing copy and page labels |
| `src/components/skeleton.tsx` | loading skeleton primitives |
| `src/components/platform-shell.tsx` | workspace shell |
| `src/components/workspace-sidebar.tsx` | sidebar navigation |
| `src/components/platform-shell-icons.tsx` | shell iconography |
| `src/components/status-badge.tsx` | compact badge system |
| `src/components/runtime-status-badge.tsx` | runtime health presentation |
| `src/lib/theme.ts` | theme mode contract |

## 17. Design Completion Standard

A new page is not visually complete until all of the following are true:

- it clearly matches one of the page templates in this document
- its dominant user decision is obvious
- its visual hierarchy follows the shell -> header -> summary -> work surface pattern
- its actions follow the primary/secondary/neutral button rules
- its metrics are paired with enough context to be interpretable
- its styling looks like part of the same product family as the existing workspace pages

