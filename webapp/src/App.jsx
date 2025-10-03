import React from "react";
import { Routes, Route } from "react-router-dom"; // no BrowserRouter here
import BookingManagement from "../src/pages/BookingManagement";
import UserManagementPage from "../src/pages/UserManagementPage";
import StationManagement from './pages/StationManagement';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<BookingManagement />} />
      <Route path="/users" element={<UserManagementPage />} />
          <Route path="/station" element={<StationManagement />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      
    </Routes>
  );
};

export default App;
