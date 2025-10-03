import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import MyCalendar from "../layouts/calendar/MyCalendar"
import "./propertyDetail.css"

export default function PropertyDetail() {
    type Property = {
        id: string;
        address: string;
        property_type: string;
    };
    const { id } = useParams();
    const [property, setProperty] = useState<Property | null>(null);

    useEffect(() => {
        // Fetch property details using the id
        const fetchPropertyDetails = async () => {
            // const response = await fetch(`http://localhost:5000/properties/${id}`);
            const response = await fetch(`https://guest-house-ecru.vercel.app/properties/${id}`);
            const data = await response.json();
            console.log("Fetched data:", data);
            setProperty(data);
        };

        fetchPropertyDetails();
    }, [id]);

    if (!property) return <div>Loading...</div>;

    return (
        <div className="property-detail">
            <p className="bold">The address:</p>
            <p>{property.address}</p>
            <p className="bold">The property type:</p>
            <p>{property.property_type}</p>
            <p className="bold">Please select a date:</p>
            <div className="calendar-container">
            <MyCalendar propertyId={property.id} />
            </div>
        </div>
    )
}
