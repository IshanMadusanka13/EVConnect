import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, UserCircle, User, Building, Calendar, LogOut, Plus } from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';

const Sidebar = ({ activePath = '/admin' }) => {
  const navigate = useNavigate();
  const { getColor } = useContext(ThemeContext);

  const sidebarItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Profile', path: '/profile', icon: UserCircle },
    { label: 'Add User', path: '/user', icon: UserCircle },
    { label: 'EV Owner', path: '/ev-owner', icon: User },
    { label: 'Charging Station', path: '/station', icon: Building },
    { label: 'Booking', path: '/booking', icon: Calendar },
    { label: 'Logout', path: '/logout', icon: LogOut },
  ];

  return (
    <div className={`fixed left-6 bottom-6 w-64 ${getColor('background.card')} backdrop-blur-sm border ${getColor('border.primary')} rounded-3xl p-6 z-10`} style={{ top: 'var(--navbar-height, 80px)' }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${getColor('text.primary')}`}>Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Panel</span></h2>
          <p className={`text-sm ${getColor('text.secondary')}`}>Management Dashboard</p>
        </div>
        <button onClick={() => navigate('/users/new')} className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <ul className="space-y-2">
        {sidebarItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.path === activePath;
          return (
            <li
              key={index}
              className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50' : getColor('hover.primary')}`}
              onClick={() => navigate(item.path)}
            >
              <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gradient-to-r from-blue-500 to-purple-600'} group-hover:shadow-lg transition-all`}>
                <Icon className={`w-5 h-5 text-white`} />
              </div>
              <span className={`font-medium ${isActive ? 'text-white' : getColor('text.primary')}`}>{item.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Sidebar;
