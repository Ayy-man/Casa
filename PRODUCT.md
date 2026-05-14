# Product

## Register

product

## Users

Casa Properties is a Vancouver, BC short-term rental operator running 26 homes
across Yaletown, Downtown, West End, Olympic Village, Pt Grey, Kitsilano, and
adjacent neighborhoods. The Command Center is a single-tenant app used by a
team of 3: Carlos Robles (CEO / Founder), Denika Patel (Portfolio Manager),
and 1–2 additional portfolio managers as the team grows.

Context of use: desktop-first, monitor or 14"+ laptop. Carlos opens this
5–10x/day on top of phone/Slack interruptions; Denika has it open continuously
during business hours. They are not power users of property-management software,
but they are sophisticated operators: they read every agent decision, they care
about reasoning, and they intervene when the agents drift from Casa's house
voice.

The interface must reward a 15-second glance ("anything broken?") and a
20-minute deep audit ("why did the Pricing Agent recommend +24.7% on Robson?")
equally well.

## Product Purpose

Casa Command Center is the human supervisor layer for Casa's AI agents
(Pricing, Guest, Ops, SOP). It exists because property ops generates dozens of
small decisions per day, ninety-something percent of which are mechanical
(repeat reply, schedule turnover, hold the rate, file the claim) and the
remaining few percent require human judgment (a guest is angry, a cleaner
ghosted, a claim needs Carlos's sign-off). The agents handle the mechanical
work in shadow mode; the Command Center surfaces only the exceptions, with full
reasoning attached, so Carlos can approve, reject, or override fast.

The primary daily job is exception triage. The Home screen, the right-rail
panels, the notification bell, and the four exception cards are the load-bearing
surface. Properties, Bookings, Cleanings, and Claims exist as drill-downs from
the exception flow, not as standalone "ops admin" tools. Agent detail pages
exist so Carlos can audit how a given decision was reached and decide whether
to flip an agent from Shadow to Live.

Success looks like: Carlos resolves a day's exceptions in under 10 minutes
total, signs off the weekly Validation Report in 20 minutes, and never feels
the need to open Hostaway, PriceLabs, or WhatsApp directly.

## Brand Personality

Editorial, restrained, premium. The Command Center reads like a serious
operating cockpit, not a SaaS app. Personality words: **considered, quiet,
authoritative**.

Voice: declarative and specific. "FIFA week. Comp set $260–$290. Recommended
+24.7%." Not "We noticed a great opportunity to boost revenue!" The agents
explain themselves like a careful analyst, not a chipper assistant. Empty
states are calm, not cute. Buttons are nouns/verbs ("Approve Resolution",
"Dispatch Backup"), never imperatives with exclamation marks.

Visual posture: Playfair Display for serif headings; Inter for sans body;
generous whitespace; ink-on-white surface with a single ≤10% blue accent. The
restraint is the point. Casa's guests pay a premium because the homes are
curated; the operator surface should feel like it was made by the same team.

## Anti-references

- **Hostaway / Lodgify / PriceLabs / Guesty.** The legacy property-management
  software aesthetic: cramped tables, muddy palettes, every pixel filled,
  fifteen-year-old UI patterns. Casa rejects this entire lineage.
- **Generic SaaS dashboard.** Hero-metric template (huge number, tiny label,
  gradient accent), identical-icon card grids, "Powerful insights at your
  fingertips" copy. Never.
- **Dark-mode AI app aesthetic.** Purple-and-black hero, neon accents,
  glassmorphism, blurred backgrounds. The agents do AI work; the chrome should
  not announce it.
- **Consumer Airbnb-warm.** Casa runs the operator side. No coral accents, no
  illustrated empty states, no marketing-warm hospitality copy.

## Design Principles

1. **Exceptions over dashboards.** The home surface shows what needs a human,
   not a vanity wall of green KPIs. If everything is fine, the status banner
   says "All clear" and nothing else competes for attention.

2. **Receipts on demand.** Every agent decision is auditable. Reasoning chains,
   comp tables, data sources, guardrails, and confidence are one click away
   from the decision itself. The product earns trust by being legible, not by
   asking for faith.

3. **Editorial silence.** Whitespace, restrained typography, and a single
   accent color do the work that decoration usually does. The interface should
   feel quiet so the content (agent decisions, guest messages, claim photos)
   has room to read.

4. **Shadow before live.** Every agent runs in Shadow Mode first, with humans
   approving its decisions, before any action pushes to Hostaway or WhatsApp.
   The UI surfaces this explicitly (Shadow Mode banners, Validation Reports,
   per-agent mode toggles). Cutover is a decision the operator makes after
   evidence, never a default.

5. **Operator-grade, not consumer-warm.** This is a back-office tool for a
   hospitality business, not a marketing site for one. The UI uses ops
   language (turnover, dispatch, resolution, comp set), accepts that the
   operator already knows their domain, and refuses to over-explain.

## Accessibility & Inclusion

WCAG 2.1 AA pragmatic across the daily flows (Home, Pricing, Cleanings,
Claims, Properties, Bookings):

- 4.5:1 minimum contrast for body text and interactive labels; 3:1 for large
  text (≥18pt or ≥14pt bold) and UI components.
- Keyboard reachable: every interactive element (sidebar nav, table rows,
  exception action buttons, side-sheets, command palette) operable without a
  mouse, with a visible 3px focus ring on `:focus-visible`.
- 10.5–11px section eyebrows and table headers are allowed as decorative
  metadata only; never the only place a critical value lives.
- `prefers-reduced-motion: reduce` honored on route fades, sheet entrances,
  and KPI hover lifts.
- Status colors (Critical / High / Medium / Low) carry both a colored dot
  and a textual label, never color alone.

Demo-grade exceptions: investor-only mock screens may break these rules
locally if explicitly tagged. The shipped product flows must not.
