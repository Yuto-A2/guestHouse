import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { formatDateCanada } from "../../utils/formatDateCanada";
import SectionTitle from "../layouts/title/SectionTitle";
import "./reservationDetail.css";

type GuestObj = { _id: string; fname?: string; lname?: string; email?: string };
type PropertyObj = { _id: string; property_type?: string; address?: string };

type Reservation = {
  _id: string;
  start_date: string;
  end_date: string;
  guest: string | GuestObj;
  property: string | PropertyObj;
  createdAt?: string;
  updatedAt?: string;
};

const displayGuest = (g: Reservation["guest"]) => {
  if (typeof g === "string") return g;
  const name = [g?.fname, g?.lname].filter(Boolean).join(" ");
  return name || g?.email || g?._id || "(unknown guest)";
};

const displayProperty = (p: Reservation["property"]) => {
  if (typeof p === "string") return p;
  return p?.property_type || p?.address || p?._id || "(unknown property)";
};

export default function GuestReservations() {
  const { guestId } = useParams<{ guestId: string }>();
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!guestId) {
      setError("Invalid guest id");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // const res = await fetch(`http://localhost:5000/guests/${guestId}/reservations`, {
        const res = await fetch(`https://guest-house-ecru.vercel.app/guests/${guestId}/reservations`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        const body = await res.json().catch(() => ([] as Reservation[]));
        if (!res.ok) {
          const msg =
            (body && typeof body === "object" && "error" in body ? (body as any).error : null) ||
            "Failed to fetch reservations";
          throw new Error(msg);
        }

        const list: Reservation[] = Array.isArray((body as any)?.data)
          ? (body as any).data
          : Array.isArray(body)
            ? (body as Reservation[])
            : [];

        setItems(list);
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "Failed to load reservations.");
      } finally {
        setLoading(false);
      }
    })();
  }, [guestId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <SectionTitle sectionTitle="Guest Reservations" />
      <div className="reservationContainer">
        {items.length === 0 ? (
          <p>There is no reservation</p>
        ) : (
          <ul className="reservationList">
            {items.map((r) => (
              <li key={r._id} className="reservationItem">
                <p><strong>Check in:</strong> {formatDateCanada(r.start_date)}</p>
                <p><strong>Check out:</strong> {formatDateCanada(r.end_date)}</p>
                <p><strong>Address:</strong> {typeof r.property === "string" ? r.property: r.property?.address || "(unknown address)"}</p>
                <p><strong>Property Type:</strong> {displayProperty(r.property)}</p>
                <Link to={`/reservations/${r._id}`}>
                  Edit my reservation
                </Link>
              </li>
            ))}
          </ul>
        )}  
      </div>
    </>
  );
}
