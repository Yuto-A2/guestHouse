import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"

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
            const response = await fetch(`http://localhost:5000/properties/${id}`);
            const data = await response.json();
            console.log("Fetched data:", data);
            setProperty(data);
        };

        fetchPropertyDetails();
    }, [id]);

    if (!property) return <div>Loading...</div>;

    return (
        <div>
            <p>{property.address}</p>
            <p>{property.property_type}</p>
        </div>
    )
}
