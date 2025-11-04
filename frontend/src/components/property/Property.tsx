import { useEffect, useRef, useState } from "react";
import Button from "../layouts/button/Button";
import { useNavigate } from "react-router-dom";
import "./property.css";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const token =
    (typeof import.meta !== "undefined" &&
        (import.meta as any)?.env?.VITE_MAPBOX_TOKEN) ||
    process.env.REACT_APP_MAPBOX_TOKEN;

mapboxgl.accessToken = token as string;

export type PropertyList = {
    _id: string;
    address: string;
    property_type: string;
    geometry?: {
        type: "Point";
        coordinates: [number, number]; // [lng, lat]
    };
};

export default function Property() {
    const navigate = useNavigate();
    const [properties, setProperties] = useState<PropertyList[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                setLoading(true);
                const response = await fetch("https://guest-house-ecru.vercel.app/admin/properties", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include", 
                });
                const data = await response.json();
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                setProperties(data);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch properties");
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    useEffect(() => {
        if (!mapRef.current) return;
        if (!mapInstanceRef.current) {
            mapInstanceRef.current = new mapboxgl.Map({
                container: mapRef.current,
                style: "mapbox://styles/mapbox/streets-v11",
                center: [-79.3832, 43.6532], // Toronto
                zoom: 10,
            });
        }

        const map = mapInstanceRef.current;

        const markers: mapboxgl.Marker[] = [];

        properties.forEach((p) => {
            if (p.geometry?.coordinates) {
                const [lng, lat] = p.geometry.coordinates;
                const marker = new mapboxgl.Marker()
                    .setLngLat([lng, lat])
                    .setPopup(
                        new mapboxgl.Popup().setHTML(
                            `<strong>${p.property_type}</strong><br>${p.address}`
                        )
                    )
                    .addTo(map);
                markers.push(marker);
            }
        });

        return () => {
            markers.forEach((m) => m.remove());
        };
    }, [properties]);

    useEffect(() => {
        return () => {
            mapInstanceRef.current?.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    if (loading) return <p>Loading properties...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="property-page">
            <div
                ref={mapRef}
                className="mapBox"
                id="map"
            />
            <div className="property">
                <ul className="property_list">
                    {properties.map((property) => (
                        <li key={property._id}>
                            <p>Address: {property.address}</p>
                            <p>Type: {property.property_type}</p>
                            <Button
                                onClick={() => navigate(`/detail/${property._id}`)}
                                text="Detail"
                                className="header_nav_button"
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
