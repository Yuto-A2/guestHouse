import { useEffect, useState } from "react";
import Button from "../layouts/button/Button";
import { useNavigate } from "react-router-dom";
import "./property.css";

export type PropertyList = {
    _id: string;
    address: string;
    property_type: string;
};

export default function Property() {
    const navigate = useNavigate();
    const [properties, setProperties] = useState<PropertyList[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                setLoading(true);
                // const response = await fetch("http://localhost:5000/admin/properties", {
                const response = await fetch("https://guest-house-ecru.vercel.app/properties", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const data = await response.json();
                if (!response.ok) throw new Error(`HTTP ${response.status}: ${data.message}`);
                setProperties(data);
            } catch (err) {
                setError("Failed to fetch properties");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    if (loading) return <p>Loading properties...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
            <div className="property">
                <ul className="property_list">
                    {properties.map((property) => (
                        <li key={property._id}>
                            <p>Address: {property.address}</p>
                            <p>Type: {property.property_type}</p>
                            <Button onClick={() => navigate(`/detail/${property._id}`)} text="Detail" className="header_nav_button" />
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}