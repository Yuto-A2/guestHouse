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

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error((body as any)?.error || "Login failed");
      }

      const rawUser: any = (body as any)?.user ?? body;

      const userId: string | undefined = rawUser?._id ?? rawUser?.id;

      if (!userId) {
        console.error("Unexpected login response:", body);
        throw new Error("User ID not found in response");
      }

      const normalized = {
        id: userId,
        name: `${rawUser?.fname ?? ""} ${rawUser?.lname ?? ""}`.trim(),
        email: rawUser?.email ?? "",
      };
      localStorage.setItem("user", JSON.stringify(normalized));
      localStorage.setItem("isLoggedIn", "true");
      window.dispatchEvent(new Event("auth-change"));
      // Navigate to dashboard page after login
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
      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </div>
  );
}
