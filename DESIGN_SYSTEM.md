# Design System

## 1. Principles
- **Clarity first**: Information should be legible and hierarchy obvious.
- **Feedback Loop**: Every action gets a reaction (sound, haptic, visual).
- **Premium Feel**: Generous whitespace, subtle shadows, rounded corners (Airbnb-esque).
- **Consistency**: One way to do things across Tenant Booking, Tenant Admin, and Super Admin.

## 2. Typography
**Font Family**: `Inter`, system-ui, sans-serif.
**Weights**:
- Regular (400) - Body text
- Medium (500) - Interactive elements, labels
- Semibold (600) - Headings, refined emphasis

**Scale**:
- Heading 1: 32px (Mobile: 28px) - Page Titles
- Heading 2: 24px (Mobile: 22px) - Section Headers
- Heading 3: 20px - Card Headers
- Body: 16px - Standard text
- Small: 14px - Secondary text, hints
- Tiny: 12px - Metadata, badges

## 3. Colors
**Primary Action**: `#FF385C` (Airbnb Red-ish) or current Brand Primary.
**Text**:
- Primary: `#1A1A1A` (Almost Black)
- Secondary: `#717171` (Dark Gray)
- Disabled: `#DDDDDD`

**Feedback**:
- Success: `#008A05` (Green)
- Error: `#E12C2C` (Red)
- Warning: `#FAAD14` (Amber)

**Backgrounds**:
- Page: `#FFFFFF`
- Secondary/Card Hover: `#F7F7F7`
- Modal Overlay: `rgba(0, 0, 0, 0.4)` (Backdrop blur 4px)

## 4. Components

### Buttons
**Height**: 48px (Large/Primary), 40px (Medium), 32px (Small).
**Radius**: `rounded-full` or `rounded-xl`.
**States**:
- **Idle**: Solid color, shadow-sm.
- **Hover**: Opacity 90%, slight scale up (1.02).
- **Active/Press**: Scale down (0.98).
- **Loading**: Spinner replaces icon, text persists or changes to "Working...".
- **Success**: Morphs to green check.
- **Error**: Shake animation + red flash.

### Inputs
**Height**: 48px.
**Border**: 1px solid `#E5E7EB`.
**Focus**: Ring with offset, primary color.
**Radius**: `rounded-xl`.

### Cards
**Surface**: White.
**Border**: 1px solid `#F3F4F6`.
**Shadow**: `shadow-sm` (idle) -> `shadow-md` (hover).
**Radius**: `rounded-2xl`.

## 5. Motion & Interaction
**Duration**:
- Micro: 150ms (Hover)
- Short: 300ms (Dialogs, Modals)
- Medium: 500ms (Page transitions)

**Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (Spring-like/iOS fee).

**Sound UX**:
- **Technology**: Web Audio API (Synthesized, lightweight, no external assets).
- **Events**:
  - `click` (Frequency 800Hz->600Hz): Primary button press.
  - `success` (Major Chord): Action completed.
  - `error` (Dissonant): Form validation fail.
- **Micro-animations**: Button press scale (0.95), focus rings.
*Must respect user preferences (mute/reduced motion).*

## 6. Layout
**Spacing Scale**: 4px base.
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px

**Container**: Max-width 1200px (Desktop), 100% (Mobile) with 16px padding.

## 7. Protected Actions (Gated)
Any sensitive action (Reserve, Login) follows the **Gated Action** pattern:
1. User clicks button.
2. Button enters `Verifying...` state (Micro-interaction).
3. Invisible reCAPTCHA executes (or challenge slides in).
4. On success: Action proceeds automatically.
5. On fail: Error toast, button resets.
