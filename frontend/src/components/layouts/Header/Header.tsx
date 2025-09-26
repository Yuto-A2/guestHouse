"use client";
import "./header.css";
import { Link, useNavigate } from "react-router-dom";
import Button from "../button/Button";
import { useEffect, useState } from "react";

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState<boolean>(
    typeof window !== "undefined" && localStorage.getItem("isLoggedIn") === "true"
  );

  useEffect(() => {
    const read = () => setUser(localStorage.getItem("isLoggedIn") === "true");

    const onAuthChange = () => read();             
    const onStorage = (e: StorageEvent) => {        
      if (e.key === "isLoggedIn") read();
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
      await fetch("http://localhost:5000/guests/logout", {
        method: "GET",           
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.setItem("isLoggedIn", "false");
      window.dispatchEvent(new Event("auth-change"));
      setUser(false);
      navigate("/");
    }
  };

  return (
    <header className="header">
      <h1 className="header__title">
        <Link to="/">Rent House</Link>
      </h1>

      <nav className="header__nav">
        <ul className={user ? "header_nav_active" : "header_nav_list"}>
          <li><Link to="/booking">My Book</Link></li>
          <li><Link to="/about">My Profile</Link></li>
        </ul>

        <div className="header_nav_buttons">
          <Button onClick={() => navigate("/signup")} text="Sign up" className="header_nav_button" />

          {user ? (
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
