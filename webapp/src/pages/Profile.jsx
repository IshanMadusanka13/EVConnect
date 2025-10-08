// src/pages/Profile.jsx
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Building,
  Settings,
  Edit,
  LayoutDashboard,
  LogOut,
  UserCircle,
  MapPin,
  Award,
  Shield
} from "lucide-react";
import { ThemeContext } from '../contexts/ThemeContext';

const Profile = () => {
  const navigate = useNavigate();
  const { darkMode, getColor } = useContext(ThemeContext);
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

      {/* Modern Sidebar */}
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
            const isActive = item.path === "/profile";
            return (
              <li 
                key={index}
                className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50' 
                    : getColor('hover.primary')
                } hover:scale-105`}
                onClick={() => navigate(item.path)}
              >
                <div className={`p-2 rounded-lg ${
                  isActive 
                    ? 'bg-white/20' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
                } group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white'}`} />
                </div>
                <span className={`font-medium ${isActive ? 'text-white' : getColor('text.primary')}`}>
                  {item.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Main Content */}
      <div className="relative flex-1 p-8 ml-80">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className={`text-4xl font-bold mb-2 ${getColor('text.primary')}`}>
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">Profile</span>
            </h1>
            <p className={`text-lg ${getColor('text.secondary')}`}>
              Manage your account information and preferences
            </p>
          </div>

          {/* Profile Card */}
          <div className={`p-8 shadow-2xl ${getColor('background.card')} backdrop-blur-sm rounded-3xl border ${getColor('border.primary')} mb-8`}>
            <div className="flex flex-col items-center space-y-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="flex items-center justify-center w-32 h-32 text-4xl font-bold text-white rounded-full shadow-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div className="absolute bottom-0 right-0 p-2 transition-transform bg-white rounded-full shadow-lg cursor-pointer hover:scale-110">
                  <Edit className="w-5 h-5 text-purple-600" />
                </div>
              </div>

              {/* Name and Role */}
              <div className="text-center">
                <h2 className={`text-3xl font-bold ${getColor('text.primary')} mb-1`}>
                  {user.firstName} {user.lastName}
                </h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                  <Shield className="w-4 h-4" />
                  {user.role}
                </div>
              </div>

              {/* Info Cards */}
              <div className="w-full mt-6 space-y-3">
                <div className={`flex items-center justify-between p-5 rounded-2xl ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'} border ${getColor('border.primary')} hover:scale-[1.02] transition-all`}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>Email Address</p>
                      <span className={`font-semibold ${getColor('text.primary')}`}>{user.email}</span>
                    </div>
                  </div>
                </div>

                <div className={`flex items-center justify-between p-5 rounded-2xl ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'} border ${getColor('border.primary')} hover:scale-[1.02] transition-all`}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>Phone Number</p>
                      <span className={`font-semibold ${getColor('text.primary')}`}>{user.phoneNumber}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <button className="flex items-center justify-center w-full gap-2 py-4 mt-6 font-semibold text-white transition-all rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105">
                <Edit className="w-5 h-5" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
            {[
              { label: 'Total Bookings', value: '156', icon: Calendar, gradient: 'from-blue-500 to-cyan-500' },
              { label: 'Managed Stations', value: '8', icon: Building, gradient: 'from-emerald-500 to-teal-500' },
              { label: 'Member Since', value: '2023', icon: Award, gradient: 'from-purple-500 to-pink-500' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={`group relative overflow-hidden rounded-2xl ${getColor('background.card')} backdrop-blur-sm border ${getColor('border.primary')} p-6 hover:scale-105 transition-all duration-300 cursor-pointer`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <div className="relative">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} w-fit mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className={`text-sm ${getColor('text.secondary')} mb-1`}>{stat.label}</p>
                    <p className={`text-3xl font-bold ${getColor('text.primary')}`}>{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                label: "My Bookings",
                description: "View your booking history and details.",
                icon: Calendar,
                gradient: "from-blue-500 to-cyan-500",
                onClick: () => navigate("/booking"),
              },
              {
                label: "My Stations",
                description: "Check the stations you manage or operate.",
                icon: MapPin,
                gradient: "from-emerald-500 to-teal-500",
                onClick: () => navigate("/station"),
              },
              {
                label: "Settings",
                description: "Update your account settings and preferences.",
                icon: Settings,
                gradient: "from-purple-500 to-pink-500",
                onClick: () => navigate("/settings"),
              },
            ].map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  onClick={card.onClick}
                  className={`group relative p-6 overflow-hidden transition-all duration-300 border cursor-pointer rounded-2xl ${getColor('border.primary')} backdrop-blur-sm hover:scale-105 ${getColor('background.card')}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  ></div>
                  <div className="relative">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${card.gradient} w-fit mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className={`text-lg font-bold mb-2 ${getColor('text.primary')}`}>{card.label}</p>
                    <p className={`text-sm ${getColor('text.secondary')}`}>{card.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;