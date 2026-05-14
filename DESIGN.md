---
name: Casa Command Center
description: The Operator's Cockpit for Casa Properties. A quiet, instrument-panel surface for AI-agent oversight in a 26-home short-term-rental portfolio.
colors:
  # ---------- Primary signal ----------
  signal-blue:           "#1E5FBF"
  signal-blue-deep:      "#134E8B"
  signal-blue-soft:      "#EAF1FB"
  signal-blue-border:    "#C9D9F0"
  # ---------- Surfaces ----------
  surface-paper:         "#FFFFFF"
  surface-soft:          "#FAFAFA"
  surface-quiet:         "#FCFBF9"
  surface-ink:           "#1A1A1A"
  surface-cockpit:       "#1A1F2A"
  # ---------- Text ramps ----------
  ink-strong:            "#1A1A1A"
  ink-mid:               "#525252"
  ink-soft:              "#737373"
  ink-faint:             "#8C8C8C"
  ink-disabled:          "#A3A3A3"
  ink-on-dark-soft:      "#C9CFD9"
  ink-on-dark-faint:     "#9AA3B2"
  # ---------- Rules / borders ----------
  border-rule:           "#E5E5E5"
  border-soft:           "#F1F1F0"
  # ---------- Status: Critical ----------
  status-critical-dot:    "#C0392B"
  status-critical-text:   "#8A2B1F"
  status-critical-soft:   "#FBEBE8"
  status-critical-border: "#F0CFC9"
  # ---------- Status: High ----------
  status-high-dot:        "#D9822B"
  status-high-text:       "#7A4A14"
  status-high-soft:       "#FBF1E4"
  status-high-border:     "#EEDAB7"
  # ---------- Status: Medium / Shadow Mode ----------
  status-medium-dot:      "#C9A22B"
  status-medium-text:     "#6F5A14"
  status-medium-soft:     "#FAF4DD"
  status-medium-border:   "#ECDFA8"
  # ---------- Status: Low / inert ----------
  status-low-dot:         "#9A9A9A"
  status-low-text:        "#525252"
  status-low-soft:        "#F2F2F1"
  status-low-border:      "#E5E5E5"
  # ---------- Status: Success ----------
  status-success-text:    "#2E6F2A"
  status-success-soft:    "#F1F6F0"
  status-success-border:  "#DDE7DA"
  # ---------- Banners ----------
  banner-amber-bg:        "#FBF5E9"
  banner-amber-text:      "#6B4A12"
  banner-amber-border:    "#EFE3C7"
  banner-green-bg:        "#F1F6F0"
  banner-green-text:      "#2E4A2A"
  banner-green-border:    "#DDE7DA"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "64px"
    fontWeight: 400
    lineHeight: "1"
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "40px"
    fontWeight: 400
    lineHeight: "1.1"
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "24px"
    fontWeight: 500
    lineHeight: "1.25"
    letterSpacing: "-0.025em"
  subtitle:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: "1.25"
    letterSpacing: "normal"
  body-large:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "1.5"
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "1.5"
    letterSpacing: "normal"
  label-eyebrow:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: "1.4"
    letterSpacing: "0.18em"
  label-pill:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "10.5px"
    fontWeight: 500
    lineHeight: "1.4"
    letterSpacing: "0.12em"
  reasoning:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "1.55"
    letterSpacing: "normal"
  mono:
    fontFamily: "SF Mono, ui-monospace, Menlo, Consolas, monospace"
    fontSize: "11.5px"
    fontWeight: 400
    lineHeight: "1.4"
    letterSpacing: "normal"
rounded:
  sharp:         "0"
  surface:       "2px"
  bubble-tail:   "4px"
  bubble:        "14px"
  pill:          "999px"
spacing:
  hair:          "2px"
  tight:         "6px"
  cozy:          "10px"
  step:          "14px"
  page-inset:    "22px"
  page-pad-x:    "40px"
  page-pad-y:    "32px"
  sidebar-width: "240px"
  topbar-height: "60px"
components:
  button-primary:
    backgroundColor: "{colors.surface-ink}"
    textColor:       "{colors.surface-paper}"
    rounded:         "{rounded.surface}"
    padding:         "0 24px"
    height:          "44px"
    typography:      "{typography.label-eyebrow}"
  button-primary-hover:
    backgroundColor: "#000000"
  button-sm-primary:
    backgroundColor: "{colors.surface-ink}"
    textColor:       "{colors.surface-paper}"
    rounded:         "{rounded.surface}"
    padding:         "0 14px"
    height:          "32px"
    typography:      "{typography.body}"
  button-sm-outline:
    backgroundColor: "{colors.surface-paper}"
    textColor:       "{colors.ink-strong}"
    rounded:         "{rounded.surface}"
    padding:         "0 14px"
    height:          "32px"
    typography:      "{typography.body}"
  button-ghost:
    backgroundColor: "{colors.surface-paper}"
    textColor:       "{colors.ink-strong}"
    rounded:         "{rounded.surface}"
    padding:         "0 14px"
    height:          "36px"
    typography:      "{typography.body}"
  icon-button:
    backgroundColor: "{colors.surface-paper}"
    textColor:       "{colors.ink-mid}"
    rounded:         "{rounded.surface}"
    padding:         "0"
    height:          "30px"
    width:           "30px"
  kpi-card:
    backgroundColor: "{colors.surface-paper}"
    rounded:         "{rounded.surface}"
    padding:         "18px 20px"
  panel:
    backgroundColor: "{colors.surface-paper}"
    rounded:         "{rounded.surface}"
    padding:         "18px 18px 14px"
  exception-card:
    backgroundColor: "{colors.surface-paper}"
    rounded:         "{rounded.surface}"
    padding:         "22px 24px 20px"
  field:
    backgroundColor: "{colors.surface-paper}"
    textColor:       "{colors.ink-strong}"
    rounded:         "{rounded.surface}"
    padding:         "0 14px"
    height:          "44px"
    typography:      "{typography.body-large}"
  topbar-search:
    backgroundColor: "{colors.surface-soft}"
    textColor:       "{colors.ink-strong}"
    rounded:         "{rounded.surface}"
    padding:         "0 12px 0 38px"
    height:          "36px"
    typography:      "{typography.body}"
---

# Design System: Casa Command Center

## 1. Overview

**Creative North Star: "The Operator's Cockpit"**

The Casa Command Center is not a dashboard, not a SaaS app, not a marketing
surface. It is the seat behind the controls of a small hospitality operation.
Ruled lines, mono numerics, quiet readouts, and exception lights do the work.
Decoration is the failure mode. Restraint is the brand.

The system rejects three lineages by name. It rejects **Hostaway / Lodgify /
PriceLabs / Guesty** and the entire legacy property-management software
aesthetic (cramped tables, muddy palettes, every pixel filled). It rejects
**generic SaaS dashboards** (hero-metric template, gradient accents, identical
icon cards, *"powerful insights"* copy). It rejects the **dark-mode AI app
aesthetic** (purple-and-black hero, neon, glassmorphism). Casa's premium homes
are curated by humans. The operator surface must read as if it were drawn by
the same team.

The Operator's Cockpit metaphor forces three habits. (a) Information density
is earned, never decorated; numbers sit in tabular figures, every column has a
reason. (b) Color enters only as signal: a critical exception lights up, a
shadow-mode banner glows amber, an approved decision turns green. (c) Type
carries the editorial register: Playfair Display for headings and reasoning,
Inter for ops surface text, mono for IDs and timestamps. The system never asks
the reader to admire it.

**Key Characteristics:**
- Single saturated accent at ≤10% surface coverage. Restrained color strategy.
- Editorial serif (Playfair Display) for hero titles and reasoning prose; Inter
  for everything else; mono for IDs, timestamps, and audit codes.
- 2px corner radius everywhere, plus 999px pill for status. No mid-range radii.
- Flat-tinted surfaces. Shadows are state, not structure: they appear on
  hover, on overlays, and on lifted panels.
- A four-tier elevation system (page, card, sheet, dialog) that lets each
  surface explain its own role.
- Two banner registers (green "all clear", amber "needs attention") that
  silently report system health at the top of every route.

## 2. Colors

A monochrome ink-on-paper base, one saturated blue used sparingly as signal,
and four status colors borrowed from a print-shop ink drawer. Every status
hue has four steps (dot, text, soft fill, border) so it can travel from a
6px dot to a full-bleed banner without losing identity.

### Primary

- **Signal Blue** (`#1E5FBF`): the single saturated accent. Active-nav left
  border on the sidebar, KPI card rule on hover, "View all" links, draft-pill
  borders, primary-key data points in sparklines. Coverage is bound by the
  *One Voice Rule* below.
- **Signal Blue Deep** (`#134E8B`): used exclusively for the Booking.com
  channel pill text, where the brighter blue would clash with the platform's
  own identity.
- **Signal Blue Soft** (`#EAF1FB`) / **Signal Blue Border** (`#C9D9F0`):
  paired soft-fill and border for the Vrbo channel pill, Confirmed booking
  pill, and Dispatched cleaning pill. The same hue family carries through
  every Casa-blue context.

### Secondary

Status palette: four channels of urgency plus a success channel. Each is a
quartet (dot, text, soft fill, border) used together in the corresponding
component family.

- **Status Critical** (`#C0392B` / `#8A2B1F` / `#FBEBE8` / `#F0CFC9`):
  Critical-urgency exceptions, NoResponse cleaning state, Cancelled bookings,
  Airbnb channel pill, "Flagged" agent decision rows. The dot color is
  reserved for the 8px urgency dot; the text color carries every label.
- **Status High** (`#D9822B` / `#7A4A14` / `#FBF1E4` / `#EEDAB7`): High-urgency
  exceptions. Warmer than Critical, never used for confirmed-broken state.
- **Status Medium** (`#C9A22B` / `#6F5A14` / `#FAF4DD` / `#ECDFA8`):
  Medium-urgency exceptions, Shadow-Mode banner color family, "Logged
  (Shadow)" decision pills, "In Progress" cleaning state. The shadow-mode
  banner's amber palette also lives here (`#FBF5E9` / `#6B4A12` / `#EFE3C7`),
  a slightly desaturated cousin used at banner scale.
- **Status Low** (`#9A9A9A` / `#525252` / `#F2F2F1` / `#E5E5E5`): inert /
  closed / resolved metadata. Reads as a quiet badge, not a signal.
- **Status Success** (`#2E6F2A` text on `#F1F6F0` soft fill, `#DDE7DA`
  border): CheckedIn bookings, Completed cleanings, Direct channel, "all
  clear" green banner (`#F1F6F0` / `#2E4A2A` / `#DDE7DA`), Resolved claims.

### Neutral

- **Surface Paper** (`#FFFFFF`): every page background, every card, every
  sheet, the field default. White is not an accident; it is the cockpit
  canvas.
- **Surface Soft** (`#FAFAFA`): topbar search well, agent-config snippet
  backgrounds, hover state of cards inside the sidebar's user menu.
- **Surface Quiet** (`#FCFBF9`): chat-thread background, table-row hover
  state. A barely-off-white that quiets repetitive content without darkening
  it.
- **Surface Cockpit** (`#1A1F2A`): the deep slate band on every agent detail
  page hero. Not "dark mode". A contextual instrument-panel reading area.
  See the *Cockpit Band Rule* in Components.
- **Surface Ink** (`#1A1A1A`): the warm near-black used for primary buttons,
  avatar circles, body text, and the dark side of every chat bubble.
- **Ink Strong → Ink Mid → Ink Soft → Ink Faint → Ink Disabled** (`#1A1A1A`,
  `#525252`, `#737373`, `#8C8C8C`, `#A3A3A3`): the five-step text ramp. Use
  Strong for primary text, Mid for sidebar nav and secondary controls, Soft
  for descriptions, Faint for eyebrow labels and table headers, Disabled for
  metadata captions.
- **Ink on Dark Soft / Faint** (`#C9CFD9`, `#9AA3B2`): mirror values for use
  on Surface Cockpit. Never use them on light surfaces.
- **Border Rule** (`#E5E5E5`): the 1px line that defines every card,
  every cell, every input, every sheet edge. The cockpit is held together
  by ruled lines, not by shadow.
- **Border Soft** (`#F1F1F0`): intra-card dividers between sibling rows
  inside a single panel. Quieter than Border Rule so it does not compete
  with the outer frame.

### Named Rules

**The One Voice Rule.** Signal Blue is used on ≤10% of any given screen.
Active-nav border, "View all" links, draft-pill outlines, primary-key
sparkline strokes. That is the budget. If a designer is reaching for blue
to make something pop, the answer is restraint, not more accent.

**The Print-Shop Ink-Drawer Rule.** Status colors are quartets, never
single hex values. A pill cannot use Critical text on a paper background;
it must use the matched soft-fill and border. This is what gives the
status system its print-shop legibility and makes Critical / High /
Medium / Low distinguishable at a glance.

**The Cockpit-Surface Reservation Rule.** `surface-cockpit` (`#1A1F2A`)
appears only on agent detail-page heroes. Not on home, not on settings, not
on reports. Its rarity is the point: a dark band signals "you have entered
an agent's operating console."

**The No Pure Black, No Pure White Rule.** `#000` and `#FFF` are forbidden.
`#1A1A1A` carries the deepest ink; `#FFFFFF` is the paper, and even on the
paper, soft / quiet / rule tints subdivide the canvas so it never reads
as flat web-white.

## 3. Typography

**Display Font:** Playfair Display (with Georgia, serif fallback)
**Body Font:** Inter (with system-ui, sans-serif fallback)
**Mono Font:** SF Mono (with ui-monospace, Menlo, Consolas fallback)

**Character:** A refined editorial serif paired with a workhorse neo-grotesque,
plus a tight system mono for receipts. The Playfair carries authority and
calm; the Inter carries operating density; the mono carries audit-grade
codes (booking IDs, claim IDs, lockbox codes, decision timestamps). The
three voices never blend, never substitute for each other.

### Hierarchy

- **Display** (400, 64px, line-height 1, tracking -0.025em): the "Casa"
  wordmark on the login page only. The single largest type element in the
  product.
- **Headline** (400, 40px, line-height 1.1, tracking -0.025em): the page
  title on every route ("Pricing Recommendations", "Properties", "Validation
  Reports"). One Headline per route, no exceptions.
- **Headline-Cockpit** (400, 36px, line-height 1.1, tracking -0.025em): the
  variant used on agent-detail dark heroes. Slightly smaller because the
  band is shorter.
- **Title** (500, 24px, line-height 1.25, tracking -0.025em): section H2s
  ("Recent Decisions", "Per Agent Breakdown", "Conversation"). Sets up a
  group of rows or cards beneath it.
- **Subtitle** (500, 18px–20px, line-height 1.25): card titles ("Exception
  type" headlines, panel titles, sheet headers).
- **Property Hero** (400, 44px, line-height 1.05, tracking -0.025em): the
  property-detail name. Reserved for property/booking detail pages.
- **KPI Number** (400, 34px–44px, line-height 1): the numeric in KPI cards
  and validation cards. Always Playfair, always tabular numerals.
- **Body Large** (400, 14px, line-height 1.5): primary readable body
  ("Last 30 days — 47 bookings."). Cap at 65–75ch.
- **Body** (400, 13px, line-height 1.5): default UI text in tables, sheet
  bodies, agent activity rows.
- **Reasoning** (Playfair, 400, 14px, line-height 1.55): the editorial
  block used for agent reasoning, claim descriptions, and any prose that
  carries decision-grade content. Max-width 60ch, two-line clamp by default
  with a "Read more" reveal.
- **Eyebrow Label** (Inter, 400, 11px, tracking 0.18em, uppercase, color
  `ink-faint`): every section header above a Title, every "WORKSPACE / DAILY
  · FRIDAY MAY 1 / SYSTEM" tag.
- **Pill Label** (Inter, 500, 10.5px, tracking 0.12em, uppercase): the text
  inside urgency pills, channel pills, status pills.
- **Mono** (SF Mono, 11.5px): booking IDs (`BK-2026-0471`), claim IDs
  (`CL-2026-0042`), lockbox codes, timestamps in agent-activity rows. Always
  in `ink-mid` or `ink-soft`; never in `ink-strong`.
- **Group Label (sidebar)** (Playfair italic, 400, 11px, tracking 0.16em,
  uppercase, color `ink-soft`): the only italic in the system. Marks the
  four sidebar groups ("Daily / Portfolio / Agents / System").

### Named Rules

**The Serif-for-Decisions Rule.** Playfair Display is reserved for two
contexts: headings, and decision-grade prose (reasoning chains, claim
descriptions, draft text). It never appears as paragraph body or UI label.
The implication is the brand: when Playfair appears, a human is meant to
pause and read.

**The Tabular-Numerals-Always Rule.** Every numeric value in the product
(rates, percentages, booking IDs, KPI numbers, table figures) uses
`font-variant-numeric: tabular-nums`. Carlos compares numbers across rows
constantly; the columns must line up.

**The One Headline Per Route Rule.** Each route has exactly one Playfair
Headline (40px). No second one. If the page needs a hero band (property
detail, agent detail), it uses a route-specific variant (Property Hero 44px,
Headline-Cockpit 36px), still exactly one per route.

## 4. Elevation

Casa runs a **four-tier layered elevation model**. Every surface declares
which tier it belongs to, which is what makes the cockpit feel like an
instrument and not a stack of generic cards. Most tiers have no shadow at
rest; shadows appear as evidence of state or overlay context.

- **Tier 0 — Page surface.** `surface-paper` background, no shadow, no border.
  The route's main column. The status banner sits at the top of Tier 0 with
  a 1px `border-rule` bottom edge.
- **Tier 1 — Card / panel.** `surface-paper` background, 1px `border-rule`
  outline, 2px corner radius. No shadow at rest. On hover, a Tier 1 surface
  may lift via `box-shadow: 0 12px 32px -16px rgba(26,26,26,0.18)` and
  translate `-1px` vertically. The blue accent rule on KPI cards is an
  additional hover-only signal layered on top.
- **Tier 2 — Side sheet.** Fixed-right pane, `surface-paper` background,
  1px `border-rule` on the left edge, no shadow. Enters from the right with
  a 280ms ease-out translate + opacity. Overlay is `rgba(26,26,26,0.40)`
  scrim across the page; the scrim is the shadow surrogate.
- **Tier 3 — Dropdown / palette / drawer.** `surface-paper` background, 1px
  `border-rule`, 2px or 4px corner radius (palette gets 4px). Carries an
  ambient shadow that signals it is floating: notification dropdown uses
  `0 18px 36px -16px rgba(26,26,26,0.18)`; command palette uses
  `0 24px 60px -16px rgba(26,26,26,0.32)`; sidebar user menu uses a quieter
  `0 6px 24px -8px rgba(26,26,26,0.10)`.
- **Tier 4 — Dialog / toast.** Modal-class surfaces. Flag dialog uses
  `0 30px 80px -20px rgba(0,0,0,0.25)`. Toast uses
  `0 12px 32px -8px rgba(26,26,26,0.40)`. Both are intentionally heavier
  than Tier 3, signaling "this owns the conversation right now."

### Shadow Vocabulary

- **shadow-card-lift** (`box-shadow: 0 12px 32px -16px rgba(26,26,26,0.18);`):
  KPI card hover.
- **shadow-card-lift-strong** (`box-shadow: 0 14px 38px -22px rgba(26,26,26,0.22);`):
  Exception card hover.
- **shadow-card-lift-property** (`box-shadow: 0 18px 40px -22px rgba(26,26,26,0.22);`):
  Property card hover. The largest lift, befitting the largest card.
- **shadow-floating-soft** (`box-shadow: 0 6px 24px -8px rgba(26,26,26,0.10);`):
  Sidebar user menu popover.
- **shadow-floating** (`box-shadow: 0 18px 36px -16px rgba(26,26,26,0.18);`):
  Notification bell dropdown.
- **shadow-palette** (`box-shadow: 0 24px 60px -16px rgba(26,26,26,0.32);`):
  Command palette.
- **shadow-dialog** (`box-shadow: 0 30px 80px -20px rgba(0,0,0,0.25);`):
  Flag-for-correction dialog.
- **shadow-toast** (`box-shadow: 0 12px 32px -8px rgba(26,26,26,0.40);`):
  Confirmation toast.

### Named Rules

**The Flat-at-Rest Rule.** Tier 0 and Tier 1 surfaces have zero shadow at
rest. Every shadow in this system is either a hover affordance or an
overlay credential. Static page shadows are forbidden.

**The Tier-Declares-Role Rule.** A surface's tier declares its role. A
floating panel without a shadow reads as broken. A static card with a
shadow reads as confused. If you are unsure which tier a new surface
belongs to, you have not yet decided what role it plays.

## 5. Components

### Buttons

Three sizes, three weights. Sharp corners (2px). Letter-spaced caps for
the primary CTA, normal-case for the small variants.

- **Shape:** 2px radius (`{rounded.surface}`). Square-edge rectangles
  read as a control, not a soft suggestion.
- **Primary** (`.btn-primary`): 44px tall, `surface-ink` background, white
  text, 13px, 500 weight, `letter-spacing: 0.06em`, uppercase. Used for
  one-and-only-one primary action per surface: "Sign In" on login, "Save
  changes" on settings.
- **Small Primary** (`.btn-sm-primary`): 32px tall, same ink/white pair,
  12px normal case. The workhorse: "Approve Resolution", "Dispatch Backup",
  "Mark Filed in Airbnb". Multiple per surface is allowed.
- **Small Outline** (`.btn-sm-outline`): 32px tall, paper background,
  ink text, 1px `border-rule`. Hover: border darkens to `surface-ink`,
  background to `surface-soft`. "Call Guest", "Reschedule", "Cancel".
- **Ghost** (`.btn-ghost`): 36px tall, paper background, ink text, 1px
  `border-rule`. Used in headers as a secondary action ("Add Property").
- **Icon-button** (`.icon-btn`): 30×30 square, 1px `border-rule`, 2px radius.
  Two semantic variants: `approve` (hover → green border + tint) and
  `reject` (hover → red border + tint). Used in the pricing decision row
  and validation comparisons.

### Cards

Three card families: KPI, exception, property. Each has its own purpose;
do not collapse them into a single "card" primitive.

- **Corner Style:** 2px (`{rounded.surface}`) everywhere.
- **Background:** `surface-paper`.
- **Shadow Strategy:** Tier 1. None at rest, `shadow-card-lift*` on hover.
- **Border:** 1px `border-rule`. The defining structural element.
- **Internal Padding:**
  - KPI card: 18px 20px, 150px min-height.
  - Exception card: 22px 24px 20px.
  - Property card: zero (the hero image abuts the edge); inner body 20px.
- **KPI card** carries a hover-only 2px blue rule on its left edge,
  inserted *inside* the border so it never reads as a colored side-stripe
  border. Hover also lifts the card 1px.
- **Exception card** carries an urgency dot, an urgency pill, an agent
  pill, a timestamp, a serif title, the property line, the reasoning prose,
  and a wrap-flex action row. It is the single most information-dense
  surface in the product; spend the padding budget here.
- **Property card** is image-led: a 4:3 hero, a status-chip overlay (only
  if status ≠ Active), title + neighborhood, type + sleeps, nightly rate
  in a 26px serif, three "check-pill" affordance chips (KB / Cleaner /
  Compliance).

### Panels

Right-rail context surfaces on the home page ("Today's Cleanings", "Today's
Check-ins / Outs", "Latest Agent Activity"). 18px padding, 1px `border-rule`,
14px Playfair panel title flush-aligned with a "View all" link in
`signal-blue`. Internal rows separated by `border-soft`.

### Fields

- **Style:** 44px tall, paper background, 1px `border-rule`, 2px radius.
- **Focus:** border darkens to `surface-ink`, plus a 3px `rgba(26,26,26,0.06)`
  outer glow. No colored focus ring; the ink ring carries the entire focus
  state across the system.
- **Topbar search** is a quieter variant: 36px tall, `surface-soft`
  background, transparent border that materializes to `border-rule` on
  focus. Used only in the top bar.
- **Placeholder:** `#9A9A9A` (`ink-faint`'s neighbor).

### Pills

Casa runs five pill families. They are visually distinct but mechanically
identical: 999px radius (`{rounded.pill}`), 22–30px tall, 10.5–12px caps
label, 1px tinted border, soft-fill tinted background. Never combine pill
families in the same row; each row uses one family.

- **Urgency pill** (`.urgency-pill`): Critical / High / Medium / Low. Used
  in exception cards, agent-activity status, decision-record status.
- **Channel pill** (`.ch-pill`): Airbnb / Vrbo / Booking.com / Direct.
  Used in booking tables, review cards.
- **Status pill** (`.status-pill`): booking lifecycle. Confirmed / CheckedIn
  / CheckedOut / Cancelled. Slightly larger (24px) than urgency pills.
- **Clean-status pill** (`.clean-status`): cleaning lifecycle. Assigned /
  Dispatched / InProgress / Completed / NoResponse. The largest at 30px;
  used as the lead status indicator in cleaning rows and sheet headers.
- **Change pill** (`.change-pill`): pricing delta. Five steps from
  change-up-strong (≥+5%) to change-down-strong (≤-5%), flat in the middle.
  Includes a `↑` / `↓` / `—` glyph plus the signed percent.

### Tabs

Bottom-border tabs, not pill tabs. 12px–18px horizontal padding, 13px label,
`ink-faint` default → `ink-strong` on hover → `ink-strong` + 2px
`signal-blue` underline + 500 weight on active. Counts appear as
`(n)` in `ink-faint`, brightening to `ink-strong` on the active tab.
Used on cleanings, claims, property detail, settings, and validation
reports.

### Navigation (Sidebar)

- **Width:** 240px desktop, 200px tablet.
- **Group label:** Playfair italic, 11px, 0.16em tracking, uppercase,
  `ink-soft`. The only italic in the system.
- **Item:** 34px tall, 13px Inter, `ink-mid` default → `ink-strong` on
  hover. Active item gets a 4px `signal-blue` left border (rendered
  inside the row, not as a separate stripe) and 500 weight.
- **Indented sub-items** (the four agent children under `Overview`) drop
  to 12.5px, get a 3px gray dot in place of an icon. Active sub-item's
  dot turns `signal-blue`.
- **Footer:** 32px avatar with name and role in two lines; clicking
  opens a Tier 3 menu-pop with "Sign out".

### Top Bar

60px tall, 1px `border-rule` bottom. Three regions: left brand cluster
(HumanOS logo, 1px vertical divider, "Casa Properties" wordmark), centered
search well (max 640px) with leading magnifier icon and trailing `⌘ K` chip,
right cluster (Help icon, notification bell with `signal-blue` badge,
avatar circle).

### Side Sheets

Tier 2 surfaces, 600px wide (720px for the claim editor). Slide in from
the right with a 280ms cubic-bezier(0.2, 0.7, 0.2, 1) translate + opacity.
The 22×28 header carries an eyebrow, a serif title, and a 32×32 close
button. The body scrolls; the header is sticky in some contexts. Used
for booking detail (in-page route, not sheet, since v2), cleaning detail,
claim editor, decision record, and validation samples.

### Chat Bubbles

Three variants. 14px corner radius with a 4px asymmetric tail on the
sender side (`bubble-tail`).
- **bubble.them** (incoming): `#F2F2F1` background, `surface-ink` text,
  left-aligned, tail bottom-left.
- **bubble.us** (outgoing): `surface-ink` background, white text,
  right-aligned, tail bottom-right.
- **bubble.draft**: white background, `ink-mid` text, 1px dashed
  `signal-blue-border`. Carries a 9.5px `signal-blue-soft`-fill pill
  reading `Draft — [Agent Name]`. This bubble is **the visual signature**
  of the Casa agent system: it is how the operator sees an AI's drafted
  reply before approving it.

### Status Banner

Page-top horizontal band, ~80px tall, 1px `border-rule` bottom. Two
registers:
- **Green** ("All clear"): `banner-green-bg`, `banner-green-text`,
  leading leaf icon.
- **Amber** ("N items need your attention"): `banner-amber-bg`,
  `banner-amber-text`, leading triangle-alert icon. Always followed by a
  "Mute" small-outline button.
The banner is the single most opinionated UI moment: it never says
"Welcome back, Carlos." It says "4 items need your attention." Or it
says nothing relevant and presents a clean green slate.

### Agent Hero (Cockpit Band)

A full-width band on every agent detail page using `surface-cockpit`
(`#1A1F2A`) as background. Carries the agent name in Headline-Cockpit,
a tagline in `ink-on-dark-soft`, an alignment chip, and a deeply colored
"Disable Agent" CTA (`#8A2B1F`) or "Enable Agent" CTA (`#2E6F2A`). This
is the *only* dark surface in the system; see the *Cockpit-Surface
Reservation Rule* in Colors.

### Command Palette

Top-centered overlay (Tier 3), 640px max-width, 14vh from top. Three-column
items: 88px kind label (uppercase, `ink-faint`), Playfair label, right-
aligned subtitle (`ink-faint`, max 240px). Footer carries `↑↓ navigate`,
`↵ open`, `esc close` instructions. Triggered by `⌘K` / `Ctrl+K`.

### Named Rules

**The Draft-Bubble Signature Rule.** The dashed-blue draft bubble is the
single most product-defining UI element. It must never be confused with
a regular outgoing message, and the `Draft — [Agent Name]` pill must
always be present. This is how the system makes Shadow Mode legible at
the conversation level.

**The Hero-Per-Detail Rule.** Property detail, booking detail, and agent
detail each get exactly one hero band. The hero is full-bleed (not
contained), uses route-specific typography, and carries the route's
primary action group flush-right of the title.

**The Pill-Family-Single-Row Rule.** Each row, table cell, or card region
uses pills from one family only. A booking row carries one channel pill
+ one status pill; an exception card carries one urgency pill + one
agent pill (but the agent pill is a different component — see
`agent-pill`). Never stack two urgency pills, never combine status +
clean-status in the same context.

## 6. Do's and Don'ts

### Do:

- **Do** keep Signal Blue (`#1E5FBF`) coverage at or below 10% of any
  given screen. *(One Voice Rule.)*
- **Do** lead the home route with a status banner: amber for exceptions,
  green for "all clear". Never with a marketing greeting.
- **Do** use Playfair Display for headings, KPI numbers, and reasoning
  prose. Use Inter for every UI label, table cell, and body sentence.
  Use SF Mono for booking IDs, claim IDs, lockbox codes, and timestamps.
- **Do** apply `font-variant-numeric: tabular-nums` to every numeric
  column and every figure ≥18px. Carlos compares across rows constantly.
- **Do** treat status colors as quartets (dot + text + soft + border).
  A Critical text on plain `surface-paper` is broken; pair it with
  `status-critical-soft` and `status-critical-border` in pills.
- **Do** declare every new surface as Tier 0 / 1 / 2 / 3 / 4 before
  styling it. Tier dictates whether it gets a border, a shadow, both,
  or neither.
- **Do** show agent reasoning. Every Pricing Agent decision row opens
  into a decision sheet with chain, comps, sources, and guardrails.
  Receipts on demand are the brand.
- **Do** label Shadow Mode explicitly with the amber banner and the
  "Logged (Shadow)" pill family. The operator must always know whether
  a decision will push to production.

### Don't:

- **Don't** use `#000` or `#FFF`. Casa's ink is `#1A1A1A`; Casa's paper
  is `#FFFFFF` with `surface-soft`, `surface-quiet`, and `border-rule`
  tints subdividing it. *(No Pure Black, No Pure White Rule.)*
- **Don't** ever use a `border-left` or `border-right` greater than 1px
  as a colored stripe on a card, list item, or alert. The KPI card's
  blue rule is implemented *inside* the border, not as a side-stripe
  border. *(Cross-register absolute ban.)*
- **Don't** use `background-clip: text` with a gradient. Gradient text
  is forbidden, no exceptions. Emphasis comes from weight or size.
- **Don't** use glassmorphism, blur backdrops, or "frosted" surfaces.
  Casa is paper-and-ink, not glass.
- **Don't** reach for the hero-metric template (huge number, tiny label,
  gradient accent, supporting stats below). The KPI cards in this
  system are deliberately quiet and identical in stature; no card is
  the "hero metric".
- **Don't** ship identical-card grids of icon + heading + body. The
  agent overview, the property grid, and the validation report all
  vary content density inside each card.
- **Don't** style the product to look like Hostaway, Lodgify, PriceLabs,
  or Guesty. If a layout feels like it could have shipped in 2014, the
  spacing is too tight, the palette is too muddy, and the table density
  is too high. Loosen everything.
- **Don't** style the product to look like a generic SaaS dashboard.
  No gradient accents, no "Powerful insights" copy, no Inter-cream
  landing pattern.
- **Don't** style the product to look like a dark-mode AI app. The only
  dark band in the system is `surface-cockpit` on the agent detail
  page, and that is one specific contextual surface, not a theme.
- **Don't** style the product to look like consumer Airbnb. No coral
  accents, no illustrated empty states, no marketing-warm copy. Casa
  runs the operator side.
- **Don't** add a second Playfair Headline to a route. One Headline per
  route. *(One Headline Per Route Rule.)*
- **Don't** drop the `Draft — [Agent Name]` pill from a draft chat
  bubble, or use the draft bubble's dashed border for any other purpose.
  *(Draft-Bubble Signature Rule.)*
- **Don't** stack two urgency pills, or combine status + clean-status
  pills, or otherwise mix pill families in a single row. *(Pill-Family
  Single-Row Rule.)*
- **Don't** animate CSS layout properties. Use `transform` and `opacity`.
  Ease out with cubic-bezier exponential curves; never bounce, never
  elastic.
