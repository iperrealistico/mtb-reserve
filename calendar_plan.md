# Admin Calendar Implementation Plan

## 1. Server Action: `getDailyBookingsAction`
- Location: `app/[slug]/admin/(protected)/calendar/actions.ts`
- Input: `slug`, `dateString` (YYYY-MM-DD)
- Logic:
  - Fetch Tenant (for timezone).
  - Calculate `startTime` (00:00) and `endTime` (23:59) in UTC using Tenant Timezone.
  - Query generic `db.booking.findMany` with `include: { bikeType: true }`.
  - Return bookings.

## 2. Component: `BookingCalendarView`
- Location: `app/[slug]/admin/(protected)/calendar/calendar-view.tsx`
- Props: `initialDate`, `initialBookings`, `slug`
- State: `date` (synced with URL via `useRouter` or just client state fetching actions? URL is better for refresh).
- UI:
  - `Calendar` (shadcn) in a Popover or inline? Inline is better for "Daily View" dashboard.
  - List of bookings grouped by Slot? Or just time-ordered list.
  - Cards for each booking:
    - Status Badge (Confirmed=Green, Pending=Yellow)
    - Customer Name/Phone
    - Bike Name x Qty
    - Actions: `Cancel` (server action), `Resend Email` (server action).

## 3. Page: `Page`
- Location: `app/[slug]/admin/(protected)/calendar/page.tsx`
- Read `searchParams.date`.
- Call `getDailyBookingsAction`.
- Render `BookingCalendarView`.
