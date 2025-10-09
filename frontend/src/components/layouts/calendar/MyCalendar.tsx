import { useEffect, useState } from "react";
import Calendar, { CalendarProps } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Button from "../button/Button";
import "./myCalendar.css";

type Range = [Date, Date] | null;

type BaseProps = {
  initialRange?: [Date, Date];
  submitLabel?: string;
};
type CreateProps = { propertyId: string; onSubmit?: never };
type UpdateProps = { propertyId?: never; onSubmit: (range: [Date, Date]) => Promise<void> | void };
type MyCalendarProps = BaseProps & (CreateProps | UpdateProps);

const TZ = "America/Toronto";
const toNoon = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12, 0, 0, 0);
const normalizeToNoon = (d: Date) => toNoon(d.getFullYear(), d.getMonth() + 1, d.getDate());

const toYYYYMMDD_Toronto = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const y = parts.find(p => p.type === "year")!.value;
  const m = parts.find(p => p.type === "month")!.value;
  const dd = parts.find(p => p.type === "day")!.value;
  return `${y}-${m}-${dd}`;
};

const todayTorontoNoon = () => {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const y = parseInt(parts.find(p => p.type === "year")!.value, 10);
  const m = parseInt(parts.find(p => p.type === "month")!.value, 10);
  const d = parseInt(parts.find(p => p.type === "day")!.value, 10);
  return toNoon(y, m, d);
};

const formatLongToronto = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ, weekday: "long", year: "numeric", month: "long", day: "numeric",
  }).format(d);

export default function MyCalendar({
  initialRange,
  submitLabel = "Reserve the house",
  ...rest
}: MyCalendarProps) {
  const [range, setRange] = useState<Range>(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    if (initialRange?.[0] && initialRange?.[1]) {
      setRange([normalizeToNoon(initialRange[0]), normalizeToNoon(initialRange[1])]);
    } else {
      setRange(null);
    }
  }, [initialRange]);

  const handleChange: CalendarProps["onChange"] = (nextValue, _event) => {
    setOk("");
    setError("");
    if (Array.isArray(nextValue)) {
      const [start, end] = nextValue as [Date | null, Date | null];
      if (start && end) {
        setRange([normalizeToNoon(start), normalizeToNoon(end)]);
      } else {
        setRange(null);
      }
    } else {
      setRange(null);
    }
  };

  const nights =
    range
      ? Math.max(0, Math.round((range[1].getTime() - range[0].getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

  const handleSubmit = async () => {
    try {
      setOk("");
      setError("");

      if (!range) return setError("Please choose check-in and check-out dates.");
      if (nights < 1) return setError("Please select at least 1 night.");

      if ("onSubmit" in rest && typeof rest.onSubmit === "function") {
        await rest.onSubmit(range);
        setOk("Reservation completed.");
        return;
      }

      if (!("propertyId" in rest) || !rest.propertyId) {
        setError("propertyId is required to create a reservation.");
        return;
      }

      const payload = {
        propertyId: rest.propertyId,
        start_date: toYYYYMMDD_Toronto(range[0]),
        end_date: toYYYYMMDD_Toronto(range[1]),
      };

      const res = await fetch("https://guest-house-ecru.vercel.app/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.status === 401) throw new Error("Please log in to make a reservation.");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Reservation failed");

      setOk(data?._id ? `Reservation completed. Reservation ID: ${data._id}` : "Reservation completed.");
    } catch (e: any) {
      setError(e?.message ?? "Reservation failed");
    }
  };

  return (
    <div>
      <Calendar
        locale="en-CA"
        selectRange
        minDate={todayTorontoNoon()}
        value={range ?? undefined}
        onChange={handleChange}  
      />

      <div>
        {range ? (
          <>
            <p><strong>Check-in:</strong> {formatLongToronto(range[0])}</p>
            <p><strong>Check-out:</strong> {formatLongToronto(range[1])}</p>
            <p><strong>Nights:</strong> {nights}</p>
          </>
        ) : (
          <p>Please select your check-in and check-out dates.</p>
        )}
        {ok && <p style={{ color: "green" }}>{ok}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      <div className="buttonContainer">
        <Button
          text={submitLabel}
          className="header_nav_button"
          onClick={handleSubmit}
          disabled={!range || nights < 1}
        />
      </div>
    </div>
  );
}
