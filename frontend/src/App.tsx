import React from 'react'
import Header from "./components/layouts/Header/Header";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Detail from "./pages/Detail";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Book from "./pages/Book";
import About from "./pages/About";
import EditReservation from "./pages/EditReservation";
import NotFound from "./pages/NotFound";
import UserDetail from "./pages/About";
import Admin from "./pages/Admin";

function App() {
  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/:id" element={<Profile />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/detail/:id" element={<Detail />} />
          <Route path="/guests/:guestId/reservations" element={<Book />} />
          <Route path="/about/:id" element={<About />} />
          <Route path="/reservations/:reservationId" element={<EditReservation />} />
          <Route path="/about/:id" element={<UserDetail />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
