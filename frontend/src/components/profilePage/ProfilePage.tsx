import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SectionTitle from "../layouts/title/SectionTitle";
import Property from "../property/Property";
import "./profilePage.css"

export default function ProfilePage() {
    type Guest = {
        id: string;
        fname: string;
        lname: string;
    };
    const { id } = useParams();
    const [user, setUser] = useState<Guest | null>(null);
    useEffect(() => {
        // Fetch user details using the idconst 
        const fetchUserDetails = async () => {
            // const response = await fetch(`http://localhost:5000/guests/${id}`);
            const response = await fetch(`/guests/${id}`);
            const data = await response.json();
            console.log("Fetched data:", data);
            setUser(data);
        };

        fetchUserDetails();
    }, [id]);

    if (!user) return <div>Loading...</div>;

    return (
        <>
            <div>
                <SectionTitle sectionTitle="Property List" />
                <p>Welcome back <span className="userName">{user.fname} {user.lname}</span></p>
            </div>
            <Property />
        </>
    );
}
