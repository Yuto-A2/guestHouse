import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import SectionTitle from "../layouts/title/SectionTitle";

export default function ReservationDetail() {
    type Reservation = {
        _id: string;
        property: {
            id: string;
            start_date: Date;
            end_date: Date;
            guest: string;
            property: string;
        };
    };

    const { id } = useParams();
    const [reservation, setReservation] = useState<Reservation | null>(null);

    useEffect(() => {
        const fetchReservationDetails = async () => {
            // const response = await fetch(`http://localhost:5000/reservations/${id}`);
            const response = await fetch(`https://guest-house-ecru.vercel.app/reservations/${id}`);
            const data = await response.json();
            setReservation(data);
        };

        fetchReservationDetails();
    }, [id]);

    if (!reservation) return <div>Loading...</div>;

    return (
        <>
            <SectionTitle sectionTitle="Reservation Detail" />
            <div>
                <div className="reservation-detail">
                    <p className="bold">The start date:</p>
                    <p>{reservation.property.start_date.toString()}</p>
                    <p className="bold">The end date:</p>
                    <p>{reservation.property.end_date.toString()}</p>
                    <p className="bold">The guest:</p>
                    <p>{reservation.property.guest}</p>
                    <p className="bold">The property:</p>
                    <p>{reservation.property.property}</p>
                </div>
            </div>
        </>
    )
}
