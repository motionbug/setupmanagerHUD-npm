# Dashboard Design Principles

Setup Manager HUD is an IT operations console for Jamf and Apple admins. It should feel reliable, fast, and easy to scan during active device enrollment work.

## Product Shape

- Build the usable dashboard first. Do not turn this project into a marketing site.
- Prioritize live operational clarity over decorative composition.
- Favor dense but organized information: KPIs, charts, filters, and tables should remain visible without excessive scrolling.
- Make failure states obvious without making the entire interface feel alarmist.

## Layout

- Keep dashboard sections as full-width page structure with constrained inner content.
- Use cards/panels for repeated data groups and framed tools, not nested decorative sections.
- Tables must remain readable at a glance. Preserve stable column widths, tabular numbers, and enough row density for repeated monitoring.
- Charts should support comparison and trend detection. Avoid chart motion that competes with live event updates.

## Motion

- High-frequency interactions should be instant or nearly instant.
- Use animation only when it improves feedback, spatial continuity, or error comprehension.
- Avoid `transition-all`; transition specific properties.
- Avoid `ease-in` for UI entrances. Prefer strong ease-out curves for appearing elements.
- Keep most UI transitions under 300ms. Button press feedback should be roughly 100-160ms.
- Pressable controls should include subtle active feedback such as a small scale change.

## Typography

- Use uppercase labels sparingly and with enough letter spacing for quick scanning.
- Reserve underlines for links.
- Use weight, size, and color for hierarchy before adding decorative text treatments.
- Keep dashboard panel headings compact; reserve large type for page-level identity only.

## Color and Theming

- Support both dark and light modes. Default to system preference.
- Use semantic color tokens: `chart-2` for success/positive, `chart-5` for failure/negative.
- Avoid pure black (#000) or pure white (#FFF) for backgrounds — use the theme's muted variants.
- Failure indicators (red glow, badges) should draw attention without making the entire UI feel alarming.
- Keep chart colors consistent across all visualizations (EventsChart, Action Quality, etc.).

## Interaction States

- All interactive elements need visible hover, focus, and active states.
- Focus rings must be visible for keyboard navigation (accessibility requirement).
- Disabled controls should look obviously inactive — reduced opacity or muted color.
- Hover states should respond within one frame; avoid delayed hover effects.
- Clickable cards or rows should have a subtle background shift on hover.

## Responsive Behavior

- Desktop is the primary viewport. Mobile is secondary but should remain usable.
- Tables scroll horizontally on narrow screens rather than reflowing into cards.
- KPI cards can stack vertically on mobile but should stay in a single row on desktop.
- Charts should maintain aspect ratio and remain readable at smaller widths.
- Filters can collapse into a disclosure or dropdown on mobile if needed.

## Empty and Loading States

- Empty states should be helpful, not just blank. Indicate what would appear and how to trigger it.
- For initial load, use skeleton placeholders that match the shape of real content.
- Avoid spinners for fast operations (<300ms). Only show loading indicators after a brief delay.
- Optimistic updates are acceptable for actions with high success rates (e.g., filter changes).
- If data fails to load, show an actionable error with retry option — not just "Something went wrong."

## Cloudflare-Aware UX

- If D1 or Durable Objects are degraded, show a direct operational warning instead of letting the dashboard look empty.
- Keep Cloudflare Access, webhook token, D1 binding, and database setup language precise in docs.
- Avoid exposing sensitive deployment values in screenshots, docs, tests, or examples.
