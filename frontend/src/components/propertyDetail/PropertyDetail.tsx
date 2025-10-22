import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import MyCalendar from "../layouts/calendar/MyCalendar";
import "./propertyDetail.css";
import Review from "../layouts/review/Review";

type Property = {
  _id?: string;
  id?: string;
  address: string;
  property_type: string;
};

type MeRes = { _id?: string; id?: string };

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [error, setError] = useState<string>("");
  const [guestId, setGuestId] = useState<string | null>(null); 

  useEffect(() => {
    if (!id) {
      setError("Route param id is missing.");
      return;
    }

    const fetchPropertyDetails = async () => {
      try {
        const res = await fetch(
          `https://guest-house-ecru.vercel.app/admin/properties/${encodeURIComponent(id)}`,
          { method: "GET", credentials: "include" }
        );
        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(`Failed to load property: ${res.status} ${t}`);
        }
        const data: Property = await res.json();
        setProperty(data);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load property.");
      }
    };

    const fetchGuestId = async () => {
      try {
        const res = await fetch(
          "https://guest-house-ecru.vercel.app/guests/id",
          // `http://localhost:5000/guests/id`,
          { method: "GET", credentials: "include" }
        );
        if (!res.ok) return;
        const me: MeRes = await res.json();
        const gid = me._id ?? me.id ?? null;
        if (gid) setGuestId(gid);
      } catch {
      }
    };

    fetchPropertyDetails();
    fetchGuestId();
  }, [id]);

  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!property) return <div>Loading...</div>;

  const propertyId = property._id ?? property.id ?? id!;

  return (
    <div className="property-detail">
      <p className="bold">The address:</p>
      <p>{property.address}</p>

      <p className="bold">The property type:</p>
      <p>{property.property_type}</p>

      <p className="bold">Please select a date:</p>
      <div className="calendar-container">
        <MyCalendar propertyId={propertyId} />
      </div>
      {guestId && <Review guestId={guestId} />}
      <Review guestId={guestId || ""} />
    </div>
  );
}
