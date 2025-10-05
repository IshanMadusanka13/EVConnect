import React from "react";
import { Routes, Route } from "react-router-dom"; // no BrowserRouter here
import BookingManagement from "../src/pages/BookingManagement";
import UserManagementPage from "../src/pages/UserManagementPage";
import StationManagement from './pages/StationManagement';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/users" element={<UserManagementPage />} />
      <Route path="/station" element={<StationManagement />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/profile" element={<Profile />} />

    </Routes>
  );
};

export default App;
