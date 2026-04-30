---
name: frontend-interaction-review
description: Review CSS and template changes for interaction issues — tooltip clipping, overflow conflicts, hover affordance gaps, missing transitions, and responsive parity. Use after modifying stylesheets, HTML templates, or interactive components.
---

# Frontend Interaction Review

Catch micro-interaction issues that agents tend to introduce when focused on layout or feature logic — the kind of problems users notice immediately but automated tests miss.

## When to use

- After modifying stylesheets or CSS that affects interactive elements
- After adding or changing tooltips, popovers, dropdowns, or modals
- After building horizontally scrollable or overflow-dependent layouts

## Checklist

Scan the changed CSS, HTML templates, and related JavaScript for these patterns:

### Tooltip & popover

- Does each tooltip have a dedicated trigger element (icon, button), not an entire card or block?
- Is there a directional visual connector (arrow, caret) linking the tooltip to its trigger?
- Are tooltips near container edges repositioned to stay visible (edge-safe positioning)?
- Is hover-only content also accessible via keyboard (`focus-visible`) and on touch devices?
- As a heuristic, is tooltip content concise (roughly under 150 characters)? Longer content often belongs in a panel or modal.

### Overflow & clipping

- Are there positioned overlays (tooltip, dropdown, modal) inside a scroll container with `overflow: auto` or `overflow: hidden`?
- When both `overflow-x` and `overflow-y` are set on the same element, does the browser's implicit overflow behavior cause unintended clipping? (Setting one axis to anything other than `visible` forces the other to `auto`.)
- Are absolutely positioned elements being clipped by an ancestor's overflow boundary?

### Click & hover affordance

- Do clickable elements have a clear visual signal: underline, `cursor: pointer`, or color change on hover?
- Is the click target appropriately scoped — a precise link or button, not an oversized card region?
- Does every `:hover` style have a corresponding `:focus-visible` state for keyboard users?

### Transition & animation

- Do show/hide toggles use `opacity` and `transform` transitions rather than hard-switching `display: none`?
- Does the cursor match the interaction semantics: `pointer` for links/buttons, `help` for info triggers, `default` for non-interactive?
- As a heuristic, are transition durations in the 150–300ms range? Shorter often feels abrupt, longer often feels sluggish.

### Responsive parity

- Do hover-dependent interactions have a touch-friendly alternative (tap to toggle, inline display on mobile)?
- Do horizontal layouts degrade gracefully on narrow viewports (vertical stack, collapse, or scroll)?
- As a common mobile guideline, do touch targets aim for roughly 44×44px or larger?

### Scroll container

- Do decorative lines or connectors inside a horizontal scroll area start and end at the correct boundaries (not extending into empty space)?
- Does the scroll container provide a scroll affordance (visible scrollbar styling, gradient fade, or shadow hint)?
- Are floating elements inside a scroll container positioned relative to scroll offset, not just the viewport?

If any of these are found, report them with file path, line numbers, and a concrete suggestion. Do not silently fix — surface the finding so the decision to change is explicit.

## Output

A short list of findings, each with:
- **What**: the specific interaction issue
- **Where**: file and line range
- **Suggestion**: concrete fix (not just "improve this")

If nothing is found, say so in one sentence.

## References

- [CSS Overflow Module Level 3](https://www.w3.org/TR/css-overflow-3/) — overflow axis interaction rules
- [Floating UI](https://floating-ui.com/) — positioning strategy for tooltips and popovers
- [WCAG 2.1 SC 1.4.13: Content on Hover or Focus](https://www.w3.org/WAI/WCAG21/Understanding/content-on-hover-or-focus.html) — accessibility requirements for hover-triggered content
