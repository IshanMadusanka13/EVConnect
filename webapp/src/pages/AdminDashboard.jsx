// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Import Recharts components
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Import icons (install lucide-react if not installed)
import { User, MapPin, Calendar } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
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

  // Sample Data for Graphs
  const userGrowthData = [
    { month: "Jan", users: 30 },
    { month: "Feb", users: 50 },
    { month: "Mar", users: 80 },
    { month: "Apr", users: 120 },
    { month: "May", users: 150 },
  ];

  const roleData = [
    { name: "Backoffice", value: 8 },
    { name: "Station Operator", value: 12 },
  ];

  const COLORS = ["#8b5cf6", "#ec4899", "#ef4444"];

  return (
    <div className="relative flex min-h-screen text-white bg-gradient-to-r from-purple-200 via-pink-100 to-blue-200">
      {/* Sidebar */}
      <div className="w-64 p-6 bg-black bg-opacity-40 backdrop-blur-lg">
        <h2 className="mb-6 text-2xl font-bold">Admin Panel</h2>
        <ul className="space-y-4">
          <li className="p-2 rounded-lg cursor-pointer hover:bg-purple-600">Dashboard</li>
          <li className="p-2 rounded-lg cursor-pointer hover:bg-purple-600">Users</li>
          <li className="p-2 rounded-lg cursor-pointer hover:bg-purple-600">Reports</li>
          <li className="p-2 rounded-lg cursor-pointer hover:bg-purple-600">Settings</li>
          <li className="p-2 rounded-lg cursor-pointer hover:bg-purple-600">Logout</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="relative flex-1 p-8 overflow-y-auto">
        <h1 className="mb-6 text-4xl font-bold text-black">Welcome, Admin 👋</h1>

        {/* Add New User Button */}
        <button
          onClick={() => navigate("/users")}
          className="absolute px-6 py-2 font-semibold text-white rounded-lg top-6 right-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:opacity-90"
        >
          Add New User
        </button>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-2">
          {/* Line Chart */}
          <div className="p-6 shadow-lg bg-white/50 backdrop-blur-md rounded-xl">
            <h2 className="mb-4 text-xl font-semibold text-black">User Growth Over Months</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="p-6 shadow-lg bg-white/50 backdrop-blur-md rounded-xl">
            <h2 className="mb-4 text-xl font-semibold text-black">Users per Role</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={roleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="p-6 shadow-lg bg-white/50 backdrop-blur-md rounded-xl md:col-span-2">
            <h2 className="mb-4 text-xl font-semibold text-black">Role Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User List */}
        <div className="w-full max-w-4xl p-6 mb-8 text-gray-900 shadow-lg bg-white/50 backdrop-blur-md rounded-xl">
          <h2 className="mb-4 text-2xl font-semibold">Registered Users</h2>

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
                className="grid grid-cols-4 gap-4 p-4 transition transform rounded-lg cursor-pointer bg-white/20 backdrop-blur-md hover:scale-105"
                onClick={() => openModal(user)}
              >
                <span className="font-medium text-black">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-black/90">{user.email}</span>
                <span className="text-black/90">{user.phoneNumber}</span>
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

        {/* Modern Management Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          {[
            {
              label: 'EV Owner Management',
              description: 'View, edit, or manage registered EV owners.',
              icon: User,
              gradient: 'from-purple-500 to-pink-500',
              onClick: () => navigate('/ev-owner'),
            },
            {
              label: 'Charging Station Management',
              description: 'Monitor and update charging station details.',
              icon: MapPin,
              gradient: 'from-blue-500 to-cyan-500',
              onClick: () => navigate('/station'),
            },
            {
              label: 'Booking Management',
              description: 'Monitor and manage booking details.',
              icon: Calendar,
              gradient: 'from-emerald-500 to-teal-500',
              onClick: () => navigate('/'),
            },
          ].map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                onClick={card.onClick}
                className="relative p-6 overflow-hidden transition-all duration-300 border cursor-pointer group rounded-2xl border-black/30 backdrop-blur-sm hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                ></div>
                <div className="relative">
                  <div className="flex items-center justify-start mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${card.gradient} mr-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-lg font-semibold text-black">{card.label}</p>
                  </div>
                  <p className="text-black/80">{card.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal */}
        {isModalOpen && selectedUser && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="p-8 text-gray-900 bg-white shadow-2xl rounded-xl w-96">
              <h2 className="mb-4 text-2xl font-bold text-center">User Details</h2>
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
                className="w-full py-2 mt-6 font-semibold text-white transition rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:opacity-90"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
