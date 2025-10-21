import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SectionTitle from "../layouts/title/SectionTitle";
import "./aboutDetail.css";
import Button from "../layouts/button/Button";

type User = {
  _id?: string;
  id?: string;
  fname: string;
  lname: string;
  email: string;
  phone_num: string;
  password?: string;
  confirmPassword?: string;
};

export default function AboutDetail() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");            
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Route param id is missing.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `https://guest-house-ecru.vercel.app/guests/${encodeURIComponent(id)}`,
          { method: "GET", credentials: "include" }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to fetch user details");
        setUser(data);
        setError("");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
    if (error) setError("");         
    if (success) setSuccess("");     
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !id) return;

    setSuccess("");                 

const hasEitherPassword = password.length > 0 || confirmPassword.length > 0;

  if (hasEitherPassword) {
    if (!password || !confirmPassword) {
      setError("Please fill out both password fields!");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
  }

    const payload: Partial<User> & { password?: string } = {
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      phone_num: user.phone_num,
    };
    if (password) payload.password = password;

    try {
      const res = await fetch(`https://guest-house-ecru.vercel.app/guests/${encodeURIComponent(id)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update");

      setSuccess("Update successfully");
      setPassword("");
      setConfirmPassword("");
      setError("");

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Update failed";
      setError(msg);
      setSuccess(""); 
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error && !user) return <div style={{ color: "red" }}>{error}</div>;
  if (!user) return <div>No user data found.</div>;

  return (
    <div>
      <SectionTitle sectionTitle="Your Information" />
      <form onSubmit={handleSubmit}>
        <label className="labelAboutDetail">
          Last Name:
          <input type="text" name="lname" value={user.lname} onChange={handleChange} className="userInfo" disabled />
        </label>
        <label className="labelAboutDetail">
          First Name:
          <input type="text" name="fname" value={user.fname} onChange={handleChange} className="userInfo" disabled />
        </label>
        <label className="labelAboutDetail">
          Email:
          <input type="email" name="email" value={user.email} onChange={handleChange} className="userInfo" />
        </label>
        <label className="labelAboutDetail">
          Phone:
          <input type="text" name="phone_num" value={user.phone_num} onChange={handleChange} className="userInfo" />
        </label>

        <label className="labelAboutDetail">
          New Password:
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="userInfo"
            autoComplete="new-password"
          />
        </label>
        <label className="labelAboutDetail">
          Confirm New Password:
          <input
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="userInfo"
            autoComplete="new-password"
          />
        </label>

        {error && <p className="errorMessage" style={{ color: "red" }}>{error}</p>}
        {success && <p className="successMessage" role="status" aria-live="polite">{success}</p>}

        <Button text="Update Information" type="submit" />
      </form>
    </div>
  );
}
