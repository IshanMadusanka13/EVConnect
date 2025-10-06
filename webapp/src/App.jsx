import React from "react";
import { Routes, Route } from "react-router-dom"; // no BrowserRouter here
import BookingManagement from "../src/pages/BookingManagement";
import UserManagementPage from "../src/pages/UserManagementPage";
import StationManagement from './pages/StationManagement';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import EVOwnerManagement from './pages/EVOwnerManagement';

const App = () => {
  return (
    <Routes>
      <Route path="/loginbooking" element={<LoginPage />} />
      <Route path="/users" element={<UserManagementPage />} />
      <Route path="/station" element={<StationManagement />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/profile" element={<Profile />} />

          <Route path="/ev-owners" element={<EVOwnerManagement />} />
    </Routes>
  );
};

export default App;
