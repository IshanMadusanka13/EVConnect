// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // store clicked user
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5116/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  }, []);

  const openModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-300 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-black bg-opacity-40 backdrop-blur-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        <ul className="space-y-4">
          <li className="hover:bg-purple-600 p-2 rounded-lg cursor-pointer">Dashboard</li>
          <li className="hover:bg-purple-600 p-2 rounded-lg cursor-pointer">Users</li>
          <li className="hover:bg-purple-600 p-2 rounded-lg cursor-pointer">Reports</li>
          <li className="hover:bg-purple-600 p-2 rounded-lg cursor-pointer">Settings</li>
          <li className="hover:bg-purple-600 p-2 rounded-lg cursor-pointer">Logout</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-4xl font-bold mb-6">Welcome, Admin 👋</h1>

        {/* User List */}
        <div className="w-full max-w-4xl p-6 bg-white/20 backdrop-blur-md rounded-xl shadow-lg text-gray-900">
          <h2 className="text-2xl font-semibold mb-4">Registered Users</h2>

          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 px-4 py-2 font-semibold border-b border-white/30">
            <span>Name</span>
            <span>Email</span>
            <span>Phone</span>
            <span>Role</span>
          </div>

          {/* Table Rows */}
          <ul className="mt-2 space-y-2">
            {users.map((user) => (
              <li
                key={user._id || user.employeeId}
                className="grid grid-cols-4 gap-4 p-4 rounded-lg bg-white/20 backdrop-blur-md cursor-pointer hover:scale-105 transform transition"
                onClick={() => openModal(user)}
              >
                <span className="font-medium text-white">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-white/90">{user.email}</span>
                <span className="text-white/90">{user.phoneNumber}</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${
                    user.role === "Backoffice" ? "bg-red-500" : "bg-blue-500"
                  }`}
                >
                  {user.role}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white text-gray-900 rounded-xl shadow-2xl p-8 w-96">
            <h2 className="text-2xl font-bold mb-4 text-center">User Details</h2>
            <div className="space-y-3">
              <p>
                <span className="font-semibold">Name:</span> {selectedUser.firstName} {selectedUser.lastName}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {selectedUser.email}
              </p>
              <p>
                <span className="font-semibold">Phone:</span> {selectedUser.phoneNumber}
              </p>
              <p>
                <span className="font-semibold">Role:</span> {selectedUser.role}
              </p>
            </div>
            <button
              className="mt-6 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
