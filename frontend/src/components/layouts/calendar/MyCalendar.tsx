import { useState } from "react";
import Calendar, { CalendarProps } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Button from "../button/Button";

type Range = [Date, Date] | null;

export default function MyCalendar() {
  const [range, setRange] = useState<Range>(null);

  const handleChange: CalendarProps["onChange"] = (nextValue) => {
    if (Array.isArray(nextValue) && nextValue[0] && nextValue[1]) {
      setRange([nextValue[0] as Date, nextValue[1] as Date]);
    } else {
      setRange(null);
    }
  };

  const formatLong = (d: Date) =>
    d.toLocaleDateString("en-CA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const nights =
    range
      ? Math.max(
          0,
          Math.round(
            (range[1].getTime() - range[0].getTime()) / (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  return (
    <div>
      <Calendar
        locale="en-CA"
        selectRange
        minDate={new Date()}
        value={range ?? undefined}
        onChange={handleChange}
      />

      <div>
        {range ? (
          <>
            <p>
              <strong>Check-in:</strong> {formatLong(range[0])}
            </p>
            <p>
              <strong>Check-out:</strong> {formatLong(range[1])}
            </p>
            <p>
              <strong>Nights:</strong> {nights}
            </p>
          </>
        ) : (
          <p>Please select your check-in and check-out dates.</p>
        )}
      </div>
    </div>
  );
}
