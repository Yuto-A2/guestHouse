import { useState } from "react";
import Calendar, { CalendarProps } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Button from "../button/Button";
import "./myCalendar.css";

type Range = [Date, Date] | null;

type MyCalendarProps = {
  propertyId: string;
};

function toYYYYMMDD(date: Date) {
  // UTC, only date part
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function MyCalendar({ propertyId }: MyCalendarProps) {
  const [range, setRange] = useState<Range>(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const handleChange: CalendarProps["onChange"] = (nextValue) => {
    setOk("");
    setError("");
    if (Array.isArray(nextValue) && nextValue[0] && nextValue[1]) {
      setRange([nextValue[0] as Date, nextValue[1] as Date]);
    } else {
      setRange(null);
    }
  };

  const submitReservation = async () => {
    try {
      setOk("");
      setError("");

      if (!range) {
        setError("Please choose check-in and check-out dates.");
        return;
      }

      // Check at least 1 night
      const nights = Math.round(
        (range[1].getTime() - range[0].getTime()) / (1000 * 60 * 60 * 24)
      );
      if (nights < 1) {
        setError("Please select at least 1 night.");
        return;
      }

      const payload = {
        propertyId,
        start_date: toYYYYMMDD(range[0]),
        end_date: toYYYYMMDD(range[1]),
      };

      const res = await fetch("http://localhost:5000/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        throw new Error("Please log in to make a reservation.");
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Reservation failed");
      }

      if (!data?._id) {
        setOk("Reservation completed.");
      } else {
        setOk("Reservation completed. Reservation ID: " + data._id);
      }
    } catch (err: any) {
      setError(err?.message ?? "Reservation failed");
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
        {ok && <p style={{ color: "green" }}>{ok}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
      <div className="buttonContainer">
        <Button
          text="Reserve the house"
          className="header_nav_button"
          onClick={submitReservation}
          disabled={!range || nights < 1}
        />
      </div>
    </div>
  );
}
