"use client";
import "./header.css";

export default function Header() {
  return (
    <header className="header">
      <h1 className="header__title">Rent House</h1>
      <nav className="header__nav">
        <button className="header_nav_button">Sign Up</button>
        <button className="header_nav_button header_nav_button_login">Login</button>
      </nav>
    </header>
  )
}