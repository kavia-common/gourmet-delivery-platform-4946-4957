# Gourmet Delivery - Design Mockups (Ocean Professional)

This folder contains static, framework-agnostic HTML/CSS mockups for key screens of the Gourmet Delivery platform. They are intended to mirror the Figma plan and demonstrate the Ocean Professional theme using a small, consistent design system.

Contents:
- index.html — hub linking to each mockup screen
- styles/
  - tokens.css — design tokens (colors, spacing, radius, shadows, typography scale)
  - base.css — reset, typography, base elements, focus ring
  - components.css — buttons, inputs, badges, cards, nav, rating, steppers, modal/drawer, tooltip, progress/spinner
  - layouts.css — containers, responsive grids (Desktop 12-col, Tablet 8-col, Mobile 4-col), utilities, layout components
- assets/
  - logo.svg — placeholder logo
- screens/
  - home.html
  - restaurant.html
  - cart-drawer.html
  - checkout.html
  - order-tracking.html
  - auth.html
  - profile.html

How to view:
- No build required. Open index.html directly in your browser.
- Or use a simple static server (e.g., npx serve) pointing at this folder.

Design system:
- Ocean Professional Theme:
  - primary: #2563EB
  - secondary: #F59E0B
  - background: #F9FAFB
  - surface: #FFFFFF
  - text: #111827
  - error: #EF4444
  - hover and pressed states derived via HSL-based adjustments where applicable.

Grids and breakpoints:
- Desktop ≥ 1024px: 12-column
- Tablet 640–1023px: 8-column
- Mobile < 640px: 4-column

Accessibility:
- Semantic landmarks: header, nav, main, aside, footer
- aria-labels and roles where helpful
- Focus indicators using tokenized focus ring
- Minimum touch target sizes 44×44px for interactive elements
- Color contrast aligned to accessible defaults

Icons:
- Using Material Symbols via CDN and inline SVG placeholders when needed.

Behavior:
- All pages are static with mocked data inline (HTML or JSON in scripts).
- The cart drawer slide-over uses a minimal script toggling data-state on the overlay/root container for demo purposes. No backend wiring.

Notes:
- These mockups are separate from the React app to avoid conflicts. They can serve as references for implementing actual components and routes in the React codebase.
