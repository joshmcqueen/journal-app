# Handoff: Journal App Redesign

## Overview
A modern dark-theme redesign of a personal journaling iOS app. Two primary screens:
1. **Calendar** — month view with per-day entry indicators, switchable between a **Grid** layout (traditional calendar) and a **Timeline** layout (vertical list of entry cards with previews).
2. **Entry** — single-day journaling view with a minimal editable text body, date context chip, word count + save status, and a "Polish with AI" assist action.

## About the Design Files
The files in this bundle are **design references created in HTML/React** — prototypes showing intended look and behavior, not production code to copy directly. The task is to **recreate these designs in the target codebase's existing environment** (e.g., React Native, Swift/SwiftUI, Flutter) using its established patterns, component libraries, and design tokens. If no environment exists yet, choose the most appropriate framework for an iOS journaling app and implement there.

Specifically: `Journal App.html` and `app.jsx` use React 18 + inline Babel purely for rapid prototyping. Do not ship the prototype bundle.

## Fidelity
**High-fidelity (hifi).** Colors, typography, spacing, radii, and interactions are final. Recreate pixel-perfectly using the target codebase's conventions.

---

## Screens / Views

### 1. Calendar — Grid layout (default)

**Purpose:** Monthly overview. User scans which days have entries and taps one to open it.

**Layout (top to bottom, 20px horizontal page padding):**
- **App header** (padding-top 68px from safe area): 28×28 rounded-corner accent-tinted "book" icon + app title "Josh's Journal" (16px/600, -0.3 letter-spacing). Right side: two 32×32 icon buttons — layout toggle (shows timeline icon when in grid view) and a "+" new-entry button (accent-tinted, active).
- **Month stepper:** Large "April" (28px/600, -0.8 letter-spacing), subtitle "2026 · 9 entries" (13px, 45% white). Right side: two 32×32 chevron buttons (prev/next month).
- **Weekday row:** 7-col grid, 10px/500 uppercase, 30% white, 1px letter-spacing ("SUN MON TUE WED THU FRI SAT").
- **Day grid:** 7-col, 4px gap, cells are aspect-ratio 1:1.05. Empty days are transparent with 30% white number. Days with an entry have a filled elevated background (`bg.elev`), white number (15px/500), and a 4×4 dot below — accent-colored for today, 35% white otherwise. Today's cell has a 1.5px accent outline (inset).
- **Stats card** (28px top margin, 16px padding, 16px radius, `bg.elev` bg with 1px line border):
  - Top row: "THIS MONTH" label (11px uppercase 40% white) + "9 day streak" (accent, 11px/500).
  - 3-column stat row: `Entries: 9` · `Words: 1,499` · `Longest: 260 (accent)` — values 20px/600 -0.5, labels 11px uppercase 40%.

**Interactions:**
- Tap any day with an entry → open Entry screen for that day.
- Tap layout toggle in header → swap to Timeline.
- Tap "+" → new entry (stubbed).

### 2. Calendar — Timeline layout

**Purpose:** Chronological feed of entries with previews.

**Layout:**
- Same header + month title/subtitle as grid.
- Vertical timeline with a 1px spine at left-48px (color: `bg.line`). Entries listed newest-first.
- **Each entry row** (gap 16, bottom padding 14):
  - Left gutter (48px): day number (22px/600 -0.5, accent if today else white), weekday abbrev (10px uppercase, 40% white, 1px letter-spacing), and a 7×7 dot with a 3px `bg.base` ring positioned on the spine. Dot is accent for today, 40% white otherwise.
  - Right card (flex 1, 14px padding, 14px radius, `bg.elev`, 1px line border, 8px left margin):
    - Top row: weekday (10px uppercase, 50% white, 1px letter-spacing) + word count (10px, 35% white, tabular-nums).
    - Body: 2-line clamped preview (13px, 75% white, line-height 1.5, text-wrap: pretty).

### 3. Entry screen

**Purpose:** Read / write / polish a single day's entry.

**Layout (top to bottom):**
- **Header strip** (padding-top 68px, padding-x 20px): Back button "‹ April" (left, 14px/500 65% white, small chevron icon). No right-side action.
- **Date chip** (24px top padding, 18px bottom padding): inline-flex pill — 6×14 padding, 99px radius, `bg.elev` background, 1px line border. Content: `"Wed, Apr 15"` (white, 500) · "Day 15 of streak" (70% white). 12px font, tabular-nums.
- **Text body (flex:1, fills all available vertical space):** full-width transparent textarea, 15.5px / line-height 1.65, text color 85% white, `text-wrap: pretty`, no border/padding. No min-height — it expands to fill the remaining phone screen.
- **Bottom dock (flex-shrink 0, padding 12/20/34):**
  - **Meta row** (12px bottom padding + 1px bottom border in `bg.line`): left `"{N} words"` (tabular-nums), right `"Saved 2m ago"`. Both 11px uppercase, 35% white, 1px letter-spacing.
  - **Button row** (gap 10):
    - **Save** — flex 1, height 48, radius 14, solid white bg, `#0A0A0B` text, 14px/600, no border.
    - **Polish with AI** — flex 1.2, height 48, radius 14, 1px accent border, accent text, transparent bg. Contains a small sparkle icon and label. When tapped, enters `polishing` state (shimmer gradient animation sweeps across, label "Polishing…"), then `polished` state (label "Polished", bg flashes `accent.hueSoft`) for 1.8s.

**Interactions:**
- Back → return to calendar.
- Polish with AI → triggers the polish animation sequence above. In production, wire to AI endpoint; do not ship the stub setTimeout.

---

## Interactions & Behavior
- **Screen transitions:** fade-in 0.3s ease on screen change (see `@keyframes fadeIn`).
- **Polish shimmer:** `@keyframes shimmer` — translateX -100% → 100%, 1.4s linear infinite while polishing.
- **Persistence:** current `screen` ("cal" | "entry") and `day` stored in localStorage so refresh preserves position. Apply the same pattern in the target app using its preferred persistence (UserDefaults / AsyncStorage / etc.).
- **Layout toggle** persists as part of the app config/preferences.

## State
- `screen: 'cal' | 'entry'`
- `day: number` (currently selected day, 1–31)
- `layout: 'grid' | 'timeline'` (user preference)
- `text: string` (current entry body)
- `polishing: boolean`, `polished: boolean` (transient UI state for AI polish button)

## Design Tokens

### Accent colors (user-selectable preference; Peach is default)
All use same OKLCH chroma/lightness for harmony:
- **Peach** (default): `oklch(82% 0.12 60)` · soft variant `oklch(82% 0.12 60 / 0.12)`
- **Gold:** `oklch(82% 0.13 85)`
- **Sage:** `oklch(80% 0.09 150)`
- **Lavender:** `oklch(80% 0.09 290)`

### Background palettes (user-selectable; Jet is default)
| Name | base | elev | elev2 | line |
|---|---|---|---|---|
| Jet (default) | `#0A0A0B` | `#121214` | `#1A1A1D` | `rgba(255,255,255,0.06)` |
| Ink | `#0E0F13` | `#171820` | `#1F2029` | `rgba(255,255,255,0.07)` |
| Obsidian | `#060608` | `#0E0E11` | `#16161A` | `rgba(255,255,255,0.05)` |

### Typography
Sans only. Default: **Inter**. Alternates: Geist, IBM Plex Sans. Use whatever your target platform's equivalent modern neutral sans is (SF Pro on iOS is a perfect fit).

Common sizes:
- Large numeric / section title: 28px/600, letter-spacing -0.8
- Day number (timeline): 22px/600, -0.5
- Day number (grid cell): 15px/500
- Body / entry text: 15.5px, line-height 1.65, text-wrap: pretty
- Button label: 14px/500–600, letter-spacing -0.2
- Card preview: 13px, line-height 1.5
- Metadata / micro label: 10–11px, uppercase, letter-spacing 1, 35–50% white
- App title: 16px/600, -0.3

### Radii
- Phone frame: 48
- Stats card / timeline card: 14–16
- Day cell: 12
- Button (header icon): 10
- Button (primary CTA): 14
- Pill / chip: 99

### Spacing
- Page horizontal padding: 20
- Grid gap: 4
- Section vertical gaps: 14, 16, 20, 24, 28

### Text colors on dark
- Primary: `#fff`
- Secondary: `rgba(255,255,255,0.7)` / `0.75`
- Tertiary: `rgba(255,255,255,0.45)` / `0.5`
- Disabled / placeholder: `rgba(255,255,255,0.3)` / `0.35`
- Micro label: `rgba(255,255,255,0.35)` / `0.4`

## Screenshots
See the `screenshots/` folder (added manually by the designer) for reference images of each screen and state.

## Assets
No external image assets. All icons are inline SVG strokes (1.3–1.5px). Replace with your codebase's icon system (SF Symbols on iOS would be ideal: `book`, `chevron.left`, `plus`, `calendar`, `list.bullet`, `sparkles`).

## Preferences / User settings
The prototype exposes these as an in-app "Tweaks" panel so the user could explore variations. In production, expose the ones you want users to keep:
- Accent color (4 options)
- Font (platform default is fine)
- Background darkness (3 options)
- Calendar layout (grid/timeline) — **also available as a header toggle on the calendar screen**

## Files in this bundle
- `Journal App.html` — entry point; renders the `<App>` and holds the screen/phone-frame scaffolding, the Tweaks panel, and `ReactDOM.createRoot` bootstrap.
- `app.jsx` — all feature components: `CalendarGrid`, `CalendarTimeline`, `EntryScreen`, `AppHeader`, `Icon` set, design tokens (`ACCENTS`, `BGS`, `FONTS`), and sample `ENTRIES` data.
- `ios-frame.jsx` — iOS device-frame utility (status bar, glass pills, nav bar, keyboard). Not used directly by the current design — the phone frame is drawn inline in `Journal App.html`'s `<Phone>` component. Kept for reference if you want a fuller iOS chrome.

## Out of scope (not designed; ask before building)
- Search
- Settings screen
- New-entry flow
- Streak calculation logic
- AI polish backend
- Onboarding / empty states
- Mood / tags (explicitly cut by the product owner)
