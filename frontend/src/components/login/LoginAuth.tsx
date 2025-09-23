// LoginAuth.tsx
import { FormEvent, useState } from "react";
import Button from "../layouts/button/Button"; 
import { useNavigate } from "react-router-dom";

export default function LoginAuth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/guests/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Login failed");
      }

      const data = await res.json();
      console.log("Logged in:", data.user);

      localStorage.setItem("auth_user", JSON.stringify(data.user));

      // 例: 画面遷移
      navigate("/", { replace: true });

      alert("Login successful");
    } catch (err: any) {
      setError(err.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 380, margin: "2rem auto" }}>
      <h2 className="text-xl font-bold mb-3">Login</h2>

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded"
            autoComplete="username"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span>Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded"
            autoComplete="current-password"
          />
        </label>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <Button
          text={loading ? "Logging in..." : "Login"}
          className="header_nav_button header_nav_button_login"
          disabled={loading}
        />
      </form>
    </div>
  );
}
