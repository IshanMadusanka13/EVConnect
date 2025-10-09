// src/pages/Profile.jsx
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from '../components/Sidebar';
import {
  Mail,
  Phone,
  Edit,
  Shield,
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
    let cancelled = false;
    const fetchUser = async () => {
      try {
        const res = await (await import('../utils/api')).default.getCurrentUser();
        if (!cancelled && res) {
          // API returns user directly
          setUser(res);
        }
      } catch (err) {
        console.error('Failed to fetch current user', err);
        // Fall back to localStorage if present
        try {
          const local = localStorage.getItem('user');
          if (local) setUser(JSON.parse(local));
        } catch (e) {
          console.error(e);
        }
      }
    };
    fetchUser();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className={`relative min-h-screen transition-colors duration-500 ${getColor('background.primary')}`}>
      <Navbar />
      <Sidebar activePath="/profile" />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-blue-600' : 'bg-blue-400'} animate-pulse`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-purple-600' : 'bg-purple-400'} animate-pulse`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 ${darkMode ? 'bg-pink-600' : 'bg-pink-400'} animate-pulse`} style={{ animationDelay: '2s' }}></div>
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
              <div className="relative group">
                <div className="flex items-center justify-center w-32 h-32 text-4xl font-bold text-white rounded-full shadow-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div className="absolute bottom-0 right-0 p-2 transition-transform bg-white rounded-full shadow-lg cursor-pointer hover:scale-110">
                  <Edit className="w-5 h-5 text-purple-600" />
                </div>
              </div>

              <div className="text-center">
                <h2 className={`text-3xl font-bold ${getColor('text.primary')} mb-1`}>
                  {user.firstName} {user.lastName}
                </h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                  <Shield className="w-4 h-4" />
                  {user.role}
                </div>
              </div>

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
        </div>
      </div>
    </div>
  );
};

export default Profile;