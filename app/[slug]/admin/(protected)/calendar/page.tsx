import { getDailyBookingsAction } from "./actions";
import BookingCalendarView from "./calendar-view";

export default async function CalendarPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ date?: string }>;
}) {
    const { slug } = await params;
    const { date } = await searchParams;

    // Fetch data server-side
    // If date is undefined, action defaults to 'today' (or we pass undefined and let action handle)
    // But action expects string. 
    // Best: passing defaults here.
    const dateStr = date || "";

    const result = await getDailyBookingsAction(slug, dateStr);

    if ("error" in result) {
        return <div className="p-8 text-red-500">Error: {result.error}</div>;
    }

    // Default to today if dateStr was empty, BUT we need to pass a Date object to the View
    // result has timezone, so we could theoretically construct 'now'
    // But for UI "selected" date, if dateStr is empty, we default to new Date()
    const initialDate = dateStr ? new Date(dateStr) : new Date();

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Calendar & Bookings</h1>
            <BookingCalendarView
                slug={slug}
                initialDate={initialDate}
                bookings={result.bookings || []}
                timezone={result.timezone || "Europe/Rome"}
            />
        </div>
    );
}
