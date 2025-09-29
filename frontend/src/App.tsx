import React from 'react'
import Header from "./components/layouts/Header/Header";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Detail from "./pages/Detail";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Book from "./pages/Book";

function App() {
  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/:id" element={<Profile />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/detail/:id" element={<Detail />} />
          <Route path="/booking/:id" element={<Book />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
