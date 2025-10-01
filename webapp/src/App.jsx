import React from "react";
import { Routes, Route } from "react-router-dom"; // no BrowserRouter here
import BookingManagement from "../src/pages/BookingManagement";
import UserManagementPage from "../src/pages/UserManagementPage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<BookingManagement />} />
      <Route path="/users" element={<UserManagementPage />} />
    </Routes>
  );
};

export default App;
