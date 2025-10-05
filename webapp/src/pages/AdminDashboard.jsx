// src/pages/AdminDashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
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
import { 
  User, 
  MapPin, 
  Calendar, 
  X, 
  TrendingUp,
  Users,
  Building,
  LayoutDashboard,
  LogOut,
  UserCircle
} from "lucide-react";
import { ThemeContext } from '../contexts/ThemeContext';
import Swal from "sweetalert2";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { darkMode, getColor } = useContext(ThemeContext);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    EmployeeId: selectedUser ? selectedUser.employeeId : "",
    PhoneNumber: "",
    Password: selectedUser ? selectedUser.password : "",
    Role: "StationOperator",
    IsActive: true,
  });

  // Fetch users
  const fetchUsers = () => {
    axios
      .get("http://localhost:5116/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      FirstName: user.firstName,
      LastName: user.lastName,
      Email: user.email,
      EmployeeId: user.employeeId,
      PhoneNumber: user.phoneNumber,
      Password: user.password,
      Role: user.role,
      IsActive: user.isActive,
    });
    setEditMode(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
    setEditMode(false);
  };

  const handleUpdate = async () => {
    
    try {
      var userid = toString(selectedUser._id);
      console.log (`http://localhost:5116/users/${selectedUser.id}`);
      console.log(editForm);
      const res = await axios.put(`http://localhost:5116/users/${selectedUser.id}`, editForm);
      Swal.fire({
        icon: "success",
        title: "User Updated!",
        text: `${res.data.firstName} ${res.data.lastName} updated successfully.`,
        timer: 2000,
        showConfirmButton: false,
      });
      fetchUsers();
      closeModal();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.response?.data?.message || "Something went wrong.",
      });
    }
  };

  // Sample static user growth
  const userGrowthData = [
    { month: "Jan", users: 30 },
    { month: "Feb", users: 50 },
    { month: "Mar", users: 80 },
    { month: "Apr", users: 120 },
    { month: "May", users: 150 },
  ];

  // Role distribution based on actual users
  const roleData = [
    { name: "Backoffice", value: users.filter(u => u.role === "Backoffice").length },
    { name: "Station Operator", value: users.filter(u => u.role === "StationOperator").length },
  ];

  const COLORS = ["#8b5cf6", "#ec4899", "#ef4444"];

  const sidebarItems = [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { label: "Profile", path: "/profile", icon: UserCircle },
    { label: "EV Owner", path: "/ev-owner", icon: User },
    { label: "Charging Station", path: "/station", icon: Building },
    { label: "Booking", path: "/booking", icon: Calendar },
    { label: "Logout", path: "/logout", icon: LogOut },
  ];

  return (
    <div className={`relative min-h-screen transition-colors duration-500 ${getColor('background.primary')}`}>
      <Navbar />
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-blue-600' : 'bg-blue-400'} animate-pulse`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-purple-600' : 'bg-purple-400'} animate-pulse`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 ${darkMode ? 'bg-pink-600' : 'bg-pink-400'} animate-pulse`} style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Sidebar */}
      <div className={`fixed left-6 top-6 bottom-6 w-64 ${getColor('background.card')} backdrop-blur-sm border ${getColor('border.primary')} rounded-3xl p-6 z-10`}>
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-1 ${getColor('text.primary')}`}>
            Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Panel</span>
          </h2>
          <p className={`text-sm ${getColor('text.secondary')}`}>Management Dashboard</p>
        </div>
        <ul className="space-y-2">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <li 
                key={index}
                className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${getColor('hover.primary')} hover:scale-105`}
                onClick={() => navigate(item.path)}
              >
                <div className="p-2 transition-all rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 group-hover:shadow-lg group-hover:shadow-blue-500/50">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className={`font-medium ${getColor('text.primary')}`}>{item.label}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Main Content */}
      <div className="relative flex-1 p-8 ml-80">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${getColor('text.primary')}`}>
            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">Admin</span>
          </h1>
          <p className={`text-lg ${getColor('text.secondary')}`}>Here's what's happening with your platform today</p>
        </div>

        <button
          onClick={() => navigate("/users")}
          className="fixed z-20 px-6 py-3 font-semibold text-white transition-all rounded-xl top-8 right-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105"
        >
          Add New User
        </button>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
          {[ { label: 'Total Users', value: users.length, change: '+12%', icon: Users, gradient: 'from-blue-500 to-cyan-500' },
             { label: 'Active Stations', value: '24', change: '+3', icon: Building, gradient: 'from-emerald-500 to-teal-500' },
             { label: 'Total Bookings', value: '1.2K', change: '+18%', icon: Calendar, gradient: 'from-purple-500 to-pink-500' },
             { label: 'Revenue', value: '$45K', change: '+23%', icon: TrendingUp, gradient: 'from-amber-500 to-orange-500' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`group relative overflow-hidden rounded-2xl ${getColor('background.card')} backdrop-blur-sm border ${getColor('border.primary')} p-6 hover:scale-105 transition-all duration-300 cursor-pointer`}>
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`text-sm font-semibold ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                      {stat.change}
                    </span>
                  </div>
                  <p className={`text-sm ${getColor('text.secondary')} mb-1`}>{stat.label}</p>
                  <p className={`text-3xl font-bold ${getColor('text.primary')}`}>{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
          {/* Line Chart */}
          <div className={`p-6 shadow-2xl ${getColor('background.card')} backdrop-blur-sm rounded-3xl border ${getColor('border.primary')}`}>
            <h2 className={`mb-6 text-xl font-bold ${getColor('text.primary')}`}>User Growth Over Months</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="month" stroke={darkMode ? '#94a3b8' : '#475569'} />
                <YAxis stroke={darkMode ? '#94a3b8' : '#475569'} />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Role Distribution Pie Chart */}
          <div className={`p-6 shadow-2xl ${getColor('background.card')} backdrop-blur-sm rounded-3xl border ${getColor('border.primary')}`}>
            <h2 className={`mb-6 text-xl font-bold ${getColor('text.primary')}`}>User Roles Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#a4eef5"
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Users List */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {users.map((user) => (
            <div
              key={user._id}
              className={`p-6 rounded-3xl border ${getColor('border.primary')} ${getColor('background.card')} cursor-pointer hover:scale-105 transition-all duration-300`}
              onClick={() => openModal(user)}
            >
              <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>Full Name</p>
              <p className={`text-lg font-semibold ${getColor('text.primary')}`}>
                {user.firstName} {user.lastName}
              </p>
              <p className={`text-xs ${getColor('text.tertiary')} mt-2 mb-1`}>Email</p>
              <p className={`text-sm font-semibold ${getColor('text.primary')}`}>{user.email}</p>
              <p className={`text-xs ${getColor('text.tertiary')} mt-2 mb-1`}>Role</p>
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-semibold text-white ${
                  user.role === "Backoffice" 
                    ? "bg-gradient-to-r from-red-500 to-pink-500" 
                    : "bg-gradient-to-r from-blue-500 to-cyan-500"
                }`}
              >
                {user.role}
              </span>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={closeModal}
            ></div>
            <div className={`relative ${getColor('background.modal')} rounded-3xl shadow-2xl max-w-md w-full animate-scaleIn border ${getColor('border.primary')}`}>
              <div className={`sticky top-0 ${getColor('background.modal')} z-10 p-6 border-b ${getColor('border.primary')}`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-2xl font-bold ${getColor('text.primary')}`}>
                    {editMode ? "Edit User" : "User Details"}
                  </h2>
                  <div className="flex gap-2">
                    {!editMode && (
                      <button
                        onClick={() => setEditMode(true)}
                        className={`px-3 py-1 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:scale-105`}
                      >
                        Edit
                      </button>
                    )}
                    <button onClick={closeModal} className={`p-2 rounded-xl ${getColor('hover.primary')} transition-colors`}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {editMode ? (
                  <>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={editForm.FirstName}
                      onChange={(e) => setEditForm({ ...editForm, FirstName: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={editForm.LastName}
                      onChange={(e) => setEditForm({ ...editForm, LastName: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={editForm.Email}
                      onChange={(e) => setEditForm({ ...editForm, Email: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={editForm.PhoneNumber}
                      onChange={(e) => setEditForm({ ...editForm, PhoneNumber: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                    />
                    <select
                      value={editForm.Role}
                      onChange={(e) => setEditForm({ ...editForm, Role: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                    >
                      <option value="Backoffice">Backoffice</option>
                      <option value="StationOperator">Station Operator</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editForm.IsActive}
                        onChange={(e) => setEditForm({ ...editForm, IsActive: e.target.checked })}
                        id="isActive"
                        className="w-4 h-4"
                      />
                      <label htmlFor="isActive" className={getColor('text.primary')}>Active</label>
                    </div>
                    <button
                      onClick={handleUpdate}
                      className="w-full py-3 mt-4 font-semibold text-white transition-all rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105"
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                      <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>Full Name</p>
                      <p className={`font-semibold text-lg ${getColor('text.primary')}`}>
                        {selectedUser.firstName} {selectedUser.lastName}
                      </p>
                    </div>
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                      <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>Email</p>
                      <p className={`font-semibold ${getColor('text.primary')}`}>{selectedUser.email}</p>
                    </div>
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                      <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>Phone</p>
                      <p className={`font-semibold ${getColor('text.primary')}`}>{selectedUser.phoneNumber}</p>
                    </div>
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                      <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>Role</p>
                      <span
                        className={`inline-block px-4 py-2 rounded-full text-sm font-semibold text-white ${
                          selectedUser.role === "Backoffice" 
                            ? "bg-gradient-to-r from-red-500 to-pink-500" 
                            : "bg-gradient-to-r from-blue-500 to-cyan-500"
                        }`}
                      >
                        {selectedUser.role}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
