// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const Profile = () => {
  const [user, setUser] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phoneNumber: "+1234567890",
    role: "Backoffice",
  });

  // Example: Fetch user profile from backend (replace URL with real API)
  useEffect(() => {
    axios
      .get("http://localhost:5116/users/123") // Example user ID
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="relative min-h-screen text-black transition-colors duration-500 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100">
      <Navbar />

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute bg-blue-400 rounded-full -top-40 -right-40 w-80 h-80 blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bg-purple-400 rounded-full -bottom-40 -left-40 w-80 h-80 blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute bg-pink-400 rounded-full top-1/2 left-1/2 w-96 h-96 blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="relative max-w-2xl px-4 pt-24 mx-auto">
        <h1 className="mb-8 text-4xl font-bold text-center">
          My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">Profile</span>
        </h1>

        {/* Profile Card */}
        <div className="p-8 shadow-2xl bg-white/30 backdrop-blur-sm rounded-3xl">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center w-24 h-24 text-2xl font-bold text-white bg-purple-300 rounded-full">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <h2 className="text-2xl font-semibold">{user.firstName} {user.lastName}</h2>
            <p className="text-gray-700">{user.role}</p>

            <div className="w-full mt-4 space-y-2">
              <div className="flex justify-between p-4 shadow-md bg-white/30 backdrop-blur-sm rounded-xl">
                <span className="font-semibold">Email</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between p-4 shadow-md bg-white/30 backdrop-blur-sm rounded-xl">
                <span className="font-semibold">Phone</span>
                <span>{user.phoneNumber}</span>
              </div>
            </div>

            <button className="w-full py-3 mt-6 font-semibold text-white transition rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:scale-105">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Extra Cards Section */}
        <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-3">
          {[
            {
              label: "My Bookings",
              description: "View your booking history and details.",
            },
            {
              label: "My Stations",
              description: "Check the stations you manage or operate.",
            },
            {
              label: "Settings",
              description: "Update your account settings and preferences.",
            },
          ].map((card, index) => (
            <div
              key={index}
              className="relative p-6 overflow-hidden transition-all duration-300 border cursor-pointer group rounded-2xl border-black/30 backdrop-blur-sm hover:scale-105"
            >
              <div className="relative">
                <p className="text-lg font-semibold">{card.label}</p>
                <p className="mt-2 text-black/80">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
