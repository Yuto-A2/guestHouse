import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { formatDateCanada } from "../../utils/formatDateCanada";
import SectionTitle from "../layouts/title/SectionTitle";
import Button from "../layouts/button/Button";
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

// Format guest display name
const displayGuest = (g: Reservation["guest"]) => {
  if (typeof g === "string") return g;
  const name = [g?.fname, g?.lname].filter(Boolean).join(" ");
  return name || g?.email || g?._id || "(unknown guest)";
};

// Format property display info
const displayProperty = (p: Reservation["property"]) => {
  if (typeof p === "string") return p;
  return p?.property_type || p?.address || p?._id || "(unknown property)";
};

export default function GuestReservations() {
  const { guestId } = useParams<{ guestId: string }>();

  // Component state
  const [items, setItems] = useState<Reservation[]>([]); // List of reservations
  const [loading, setLoading] = useState(true); // Loading flag
  const [error, setError] = useState<string | null>(null); // Error message
  const [deletingId, setDeletingId] = useState<string | null>(null); // Track which reservation is being deleted

  // Fetch guest reservations when component mounts
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

        // Fetch reservation data
        const res = await fetch(
          `https://guest-house-ecru.vercel.app/guests/${guestId}/reservations`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        const body = await res.json().catch(() => ([] as Reservation[]));

        if (!res.ok) {
          const msg =
            (body && typeof body === "object" && "error" in body
              ? (body as any).error
              : null) || "Failed to fetch reservations";
          throw new Error(msg);
        }

        // Parse the list from the response
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

  // Handle deleting a reservation
  const handleDelete = async (reservationId: string) => {
    // Ask for user confirmation before deleting
    const ok = window.confirm("Are you sure you want to delete this reservation?");
    if (!ok) return;

    try {
      setError(null);
      setDeletingId(reservationId); // Mark which reservation is being deleted

      const res = await fetch(
        `https://guest-house-ecru.vercel.app/reservations/${encodeURIComponent(
          reservationId
        )}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      // Some APIs return 204 No Content, others return deleted object
      let deletedId = reservationId;

      if (res.status !== 204) {
        const data = await res
          .json()
          .catch(() => null as null | Reservation | { _id?: string });

        if (!res.ok) {
          const t = (data && (data as any)?.error) || JSON.stringify(data) || "";
          throw new Error(`Failed to delete reservation: ${res.status} ${t}`);
        }

        // If response includes deleted reservation ID, use it
        if (data && typeof data === "object" && "_id" in data && (data as any)._id) {
          deletedId = (data as any)._id as string;
        }
      } else if (!res.ok) {
        throw new Error(`Failed to delete reservation: ${res.status}`);
      }

      // Remove deleted item from local state
      setItems((prev) => prev.filter((item) => item._id !== deletedId));
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to delete reservation.");
    } finally {
      setDeletingId(null); // Reset delete state
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "crimson" }}>{error}</div>;

  return (
    <>
      <SectionTitle sectionTitle="Guest Reservations" />
      <div className="reservationContainer">
        {items.length === 0 ? (
          <p>There is no reservation</p>
        ) : (
          <ul className="reservationList">
            {items.map((r) => {
              const isDeleting = deletingId === r._id;
              return (
                <li key={r._id} className="reservationItem">
                  <p>
                    <strong>Check in:</strong> {formatDateCanada(r.start_date)}
                  </p>
                  <p>
                    <strong>Check out:</strong> {formatDateCanada(r.end_date)}
                  </p>
                  <p>
                    <strong>Address:</strong>{" "}
                    {typeof r.property === "string"
                      ? r.property
                      : r.property?.address || "(unknown address)"}
                  </p>
                  <p>
                    <strong>Property Type:</strong> {displayProperty(r.property)}
                  </p>

                  <div className="reservationActions">
                    {/* Edit link */}
                    <Link to={`/reservations/${r._id}`} className="editLink">
                      Edit my reservation
                    </Link>

                    {/* Delete button */}
                    <Button
                      text="Delete"
                      className="deleteButton"
                      onClick={() => handleDelete(r._id)}
                      disabled={isDeleting}
                      aria-busy={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
