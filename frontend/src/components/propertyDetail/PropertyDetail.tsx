import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import MyCalendar from "../layouts/calendar/MyCalendar";
import "./propertyDetail.css";

type Property = {
  _id?: string;
  id?: string;
  address: string;
  property_type: string;
};

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!id) {
      setError("Route param id is missing.");
      return;
    }

    const fetchPropertyDetails = async () => {
      try {
        // const res = await fetch(`http://localhost:5000/admin/properties/${encodeURIComponent(id)}`,;
        const res = await fetch(`https://guest-house-ecru.vercel.app/admin/properties/${encodeURIComponent(id)}`,
          {
            method: "GET",
            credentials: "include"
          });
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

    fetchPropertyDetails();
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
    </div>
  );
}
