"use client";
import "./header.css";
import { Link } from "react-router-dom";

export default function Header() {
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
          <button className="header_nav_button">Sign Up</button>
          <button className="header_nav_button header_nav_button_login">Login</button>
        </div>
      </nav>
    </header>

  )
}