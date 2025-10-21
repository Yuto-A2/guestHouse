import SectionTitle from "../components/layouts/title/SectionTitle";
import SignupForm from "../components/layouts/signup/SignupForm";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (fd: FormData) => {
    const payload = Object.fromEntries(fd.entries()) as Record<string, string>;
    try {
      // 1) Signup API
      const res = await fetch("https://guest-house-ecru.vercel.app/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`HTTP ${res.status}: ${msg}`);
      }

      // 2) Auto Login
      const loginRes = await fetch("https://guest-house-ecru.vercel.app/guests/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: payload.email,
          password: payload.password,
        }),
      });

      const loginData = await loginRes.json().catch(() => ({}));
      if (!loginRes.ok) {
        throw new Error((loginData as any)?.error || "Auto login failed");
      }

      const userObj =
        (loginData as any)?.user ??
        (loginData as any)?.data ??
        loginData;

      const userId =
        userObj?.id ?? userObj?._id ?? userObj?.userId ?? userObj?.uid;

      if (!userId) {
        console.error("Login response:", loginData);
        throw new Error("User ID not found");
      }

      try {
        const headerUser = {
          id: String(userId),
          name:
            userObj?.name ??
            (
              [userObj?.fname, userObj?.lname].filter(Boolean).join(" ") || undefined
            ),
        };


        localStorage.setItem("user", JSON.stringify(headerUser));
        localStorage.setItem("isLoggedIn", "true");

        window.dispatchEvent(new Event("auth-change"));
      } catch {
        /* no-op */
      }

      navigate(`/${String(userId)}`, { replace: true });
      setMessage("Sign up successful!");
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message ?? "Sign up failed. Please try again.");
    }
  };

  return (
    <>
      <SectionTitle sectionTitle="Create Account" />
      <SignupForm
        onSubmit={handleSignup}
        text="Sign Up"
        fieldItems={[
          "fname",
          "lname",
          "email",
          "phone_num",
          "password",
          "confirmPassword",
        ]}
      />

      {message && (
        <p style={{ color: "red", textAlign: "center" }}>
          {message}
        </p>
      )}
    </>
  );
}
