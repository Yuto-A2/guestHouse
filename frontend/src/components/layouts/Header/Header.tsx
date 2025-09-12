"use client";
import "./header.css";
import { Link, useNavigate } from "react-router-dom";
import Button from "../button/Button";

export default function Header() {
  const navigate = useNavigate();
  return (
    <header className="header">
      <h1 className="header__title">
        <Link to="/">Rent House</Link>
      </h1>
      {/* Navigation */}
      <nav className="header__nav">
        <ul className="header_nav_list">
          <li><Link to="/booking">My Book</Link></li>
          <li><Link to="/about">My Profile</Link></li>
        </ul>
        {/* Button */}
        <div className="header_nav_buttons">
          <Button onClick={() => navigate("/signup")} text="Sign up" className="header_nav_button" />
          <Button onClick={() => navigate("/login")} text="Login" className="header_nav_button header_nav_button_login" />
        </div>
      </nav>
    </header>

  )
}