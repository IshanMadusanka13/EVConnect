import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Search, Filter, Plus, X, ChevronDown, Bell, Sun, Moon, User, Home, Users, BarChart3, Settings, LogOut, Edit, Trash2, Eye, QrCode, AlertCircle, Check, Zap, Battery, Navigation } from 'lucide-react';

// Navbar Component
const Navbar = ({ darkMode, setDarkMode }) => {

  return (
    <>
      {/* Modern Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-40 ${darkMode ? 'bg-slate-900/80' : 'bg-white/80'} backdrop-blur-xl border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-75"></div>
                      <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        EV Charge<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Hub</span>
                      </h1>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Booking Management</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className={`p-2 rounded-xl ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} transition-colors relative`}>
                      <Bell className={`w-5 h-5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`} />
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <button 
                      onClick={() => setDarkMode(!darkMode)}
                      className={`p-2 rounded-xl ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} transition-colors`}
                    >
                      {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
                    </button>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold cursor-pointer hover:scale-105 transition-transform`}>
                      JD
                    </div>
                  </div>
                </div>
              </div>
            </nav>

      
    </>
  );
};

export default Navbar;