import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SectionTitle from "../layouts/title/SectionTitle";
import MyCalendar from "../layouts/calendar/MyCalendar";

type Reservation = {
  _id: string;
  start_date: string; 
  end_date: string;
};

const fromServerISOToLocalNoon = (iso: string) => {
  const d = new Date(iso);                 
  const y = d.getUTCFullYear();            
  const m = d.getUTCMonth() + 1;           
  const day = d.getUTCDate();              
  return new Date(y, m - 1, day, 12, 0, 0, 0); 
};

const toYYYYMMDD_Toronto = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = parts.find(p => p.type === "year")!.value;
  const m = parts.find(p => p.type === "month")!.value;
  const d = parts.find(p => p.type === "day")!.value;
  return `${y}-${m}-${d}`;
};

export default function UpdateReservation() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();

  const [resv, setResv] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!reservationId) {
      setErr("Invalid reservation id.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(
          `https://guest-house-ecru.vercel.app/reservations/${reservationId}`,
          { credentials: "include" }
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to fetch reservation");
        const payload: Reservation = (data?.data ?? data) as Reservation;
        setResv(payload);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load reservation.");
      } finally {
        setLoading(false);
      }
    })();
  }, [reservationId]);

  const initialRange = useMemo(() => {
    if (!resv?.start_date || !resv?.end_date) return undefined;
    return [
      fromServerISOToLocalNoon(resv.start_date),
      fromServerISOToLocalNoon(resv.end_date),
    ] as [Date, Date];
  }, [resv]);

  const handleUpdate = async (range: [Date, Date]) => {
    if (!reservationId) throw new Error("Invalid reservation id.");
    const payload = {
      start_date: toYYYYMMDD_Toronto(range[0]),
      end_date: toYYYYMMDD_Toronto(range[1]),
    };
    const res = await fetch(
      `https://guest-house-ecru.vercel.app/reservations/${reservationId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Failed to update reservation");
    navigate(-1);
  };

  if (loading) return <div>Loading...</div>;
  if (err) return <div style={{ color: "red" }}>{err}</div>;
  if (!resv) return <div>Reservation not found.</div>;

  return (
    <div>
      <SectionTitle sectionTitle="Edit Your Reservation" />
      <MyCalendar
        initialRange={initialRange}
        onSubmit={handleUpdate}
        submitLabel="Save changes"
      />
    </div>
  );
}
