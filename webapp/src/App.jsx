import React from "react";
import { Routes, Route } from "react-router-dom";
import BookingManagement from "../src/pages/BookingManagement";
import StationManagement from './pages/StationManagement';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import EVOwnerManagement from './pages/EVOwnerManagement';
import AddUser from "./pages/AddUser";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/user" element={<AddUser />} />
      <Route path="/booking" element={<BookingManagement />} />
      <Route path="/station" element={<StationManagement />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/ev-owners" element={<EVOwnerManagement />} />
    </Routes>
  );
};

export default App;
