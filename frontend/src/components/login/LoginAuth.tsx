// LoginAuth.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignupForm from "../layouts/signup/SignupForm";
import SectionTitle from "../layouts/title/SectionTitle";

export default function LoginAuth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoginSubmit = async (fd: FormData) => {
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");

    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/guests/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Login failed");
      }

      const data = await res.json();
      localStorage.setItem("auth_user", JSON.stringify(data.user));

      const userId = data?.user?.id;
      if (!userId) throw new Error("User ID not found");
      navigate(`/${userId}`, { replace: true });
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionTitle sectionTitle="Login" />
      <SignupForm
        text={loading ? "Logging in..." : "Login"}
        fieldItems={["email", "password"]}
        onSubmit={handleLoginSubmit}
      />

      {error && <p>{error}</p>}
    </div>
  );
}
