"use client";
import "./header.css";
import { Link, useNavigate } from "react-router-dom";
import Button from "../button/Button";
import { useEffect, useState } from "react";

type AuthUser = { id: string; name?: string } | null;

export default function Header() {
  const navigate = useNavigate();

  // Manage user state with localStorage synchronization
  const [user, setUser] = useState<AuthUser>(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  const isLoggedIn = !!user;

  useEffect(() => {
    const read = () => {
      const raw = localStorage.getItem("user");
      setUser(raw ? JSON.parse(raw) : null);
    };

    const onAuthChange = () => read();
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "user" || e.key === "isLoggedIn") read();
    };

    window.addEventListener("auth-change", onAuthChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("auth-change", onAuthChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // await fetch("http://localhost:5000/guests/logout", {
      await fetch("https://guest-house-ecru.vercel.app/guests/logout", {
        method: "GET",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.setItem("isLoggedIn", "false");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-change"));
      setUser(null);
      navigate("/");
    }
  };

  return (
    <header className="header">
      <h1 className="header__title">
        <Link to={isLoggedIn ? `/${user!.id}` : "/"}>Rent House</Link>
      </h1>

      <nav className="header__nav">
        <ul className={isLoggedIn ? "header_nav_active" : "header_nav_list"}>
          <li>
            <Link to={isLoggedIn ? `/guests/${user!.id}/reservations` : "/booking"}>My Book</Link>
          </li>
          <li>
            <Link to={isLoggedIn ? `/about/${user!.id}` : "/booking"}>My Profile</Link>
          </li>
        </ul>

        <div className="header_nav_buttons">
         {isLoggedIn ? ( <Button
            onClick={() => navigate("/signup")}
            text="Sign up"
            className="header_nav_button_disabled"
          />) : ( <Button
            onClick={() => navigate("/signup")}
            text="Sign up"
            className="header_nav_button"
          />
         )}

          {isLoggedIn ? (
            <Button
              onClick={handleLogout}
              text="Logout"
              className="header_nav_button header_nav_button_login"
            />
          ) : (
            <Button
              onClick={() => navigate("/login")}
              text="Login"
              className="header_nav_button header_nav_button_login"
            />
          )}
        </div>
      </nav>
    </header>
  );
}
