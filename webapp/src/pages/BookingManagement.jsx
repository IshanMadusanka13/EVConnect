import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Search, Filter, Plus, X, ChevronDown, Bell, Sun, Moon, User, Home, Users, BarChart3, Settings, LogOut, Edit, Trash2, Eye, QrCode, AlertCircle, Check, Zap, Battery, Navigation, TrendingUp, Activity, Star, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    search: ''
  });

  useEffect(() => {
    setTimeout(() => {
      setBookings([
        {
          id: '1',
          stationName: 'Downtown Charging Hub',
          stationId: 'ST001',
          slotId: 'SL001',
          reservationDate: '2024-01-15',
          startTime: '14:00',
          endTime: '16:00',
          status: 'Confirmed',
          chargerType: 'DC Fast',
          energyConsumed: 45.5,
          cost: 22.75,
          qrCodeData: 'QR123456',
          customerName: 'John Doe',
          vehicleModel: 'Tesla Model 3',
          rating: 4.8
        },
        {
          id: '2',
          stationName: 'Mall Parking Station',
          stationId: 'ST002',
          slotId: 'SL003',
          reservationDate: '2024-01-16',
          startTime: '10:00',
          endTime: '11:30',
          status: 'Pending',
          chargerType: 'AC',
          energyConsumed: 0,
          cost: 0,
          qrCodeData: 'QR789012',
          customerName: 'Jane Smith',
          vehicleModel: 'Nissan Leaf',
          rating: 4.5
        },
        {
          id: '3',
          stationName: 'Airport Express Charge',
          stationId: 'ST003',
          slotId: 'SL002',
          reservationDate: '2024-01-14',
          startTime: '09:00',
          endTime: '09:45',
          status: 'Completed',
          chargerType: 'DC Fast',
          energyConsumed: 35.2,
          cost: 17.60,
          qrCodeData: 'QR345678',
          customerName: 'Mike Johnson',
          vehicleModel: 'BMW i4',
          rating: 5.0
        },
        {
          id: '4',
          stationName: 'City Center Hub',
          stationId: 'ST004',
          slotId: 'SL005',
          reservationDate: '2024-01-17',
          startTime: '15:00',
          endTime: '16:30',
          status: 'Confirmed',
          chargerType: 'AC',
          energyConsumed: 0,
          cost: 0,
          qrCodeData: 'QR456789',
          customerName: 'Sarah Wilson',
          vehicleModel: 'Audi e-tron',
          rating: 4.7
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'from-emerald-400 to-teal-500';
      case 'Pending': return 'from-amber-400 to-orange-500';
      case 'Completed': return 'from-blue-400 to-indigo-500';
      case 'Cancelled': return 'from-red-400 to-pink-500';
      default: return 'from-gray-400 to-slate-500';
    }
  };

  const getChargerIcon = (type) => {
    return type === 'DC Fast' ? 
      <Zap className="w-5 h-5 text-orange-400" /> : 
      <Battery className="w-5 h-5 text-emerald-400" />;
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50'}`}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-blue-600' : 'bg-blue-400'} animate-pulse`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-purple-600' : 'bg-purple-400'} animate-pulse`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 ${darkMode ? 'bg-pink-600' : 'bg-pink-400'} animate-pulse`} style={{ animationDelay: '2s' }}></div>
      </div>

      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Main Content */}
      <div className="relative pt-24 pb-8 px-4 max-w-7xl mx-auto">
        {/* Header with Gradient */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className={`px-3 py-1 rounded-full ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'} text-sm font-medium`}>
              Dashboard
            </div>
            <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
            <div className={`px-3 py-1 rounded-full ${darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'} text-sm font-medium`}>
              Bookings
            </div>
          </div>
          <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">Bookings</span>
          </h1>
          <p className={`text-lg ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Manage all your EV charging reservations in one place
          </p>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Bookings', value: '156', change: '+12%', icon: Calendar, gradient: 'from-blue-500 to-cyan-500' },
            { label: 'Active Sessions', value: '8', change: '+2', icon: Activity, gradient: 'from-emerald-500 to-teal-500' },
            { label: 'Pending', value: '23', change: '-5', icon: Clock, gradient: 'from-amber-500 to-orange-500' },
            { label: 'Revenue', value: '$1.2K', change: '+18%', icon: TrendingUp, gradient: 'from-purple-500 to-pink-500' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-2xl ${darkMode ? 'bg-slate-900/50' : 'bg-white'} backdrop-blur-sm border ${darkMode ? 'border-slate-800' : 'border-slate-200'} p-6 hover:scale-105 transition-all duration-300 cursor-pointer`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
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
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'} mb-1`}>{stat.label}</p>
                  <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters Section */}
        <div className={`${darkMode ? 'bg-slate-900/50' : 'bg-white'} backdrop-blur-sm rounded-2xl border ${darkMode ? 'border-slate-800' : 'border-slate-200'} p-6 mb-6`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className={`pl-12 pr-4 py-3 rounded-xl border ${darkMode ? 'border-slate-700 bg-slate-800 text-white placeholder-slate-500' : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full md:w-80`}
                />
              </div>

              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className={`px-4 py-3 rounded-xl border ${darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className={`px-4 py-3 rounded-xl border ${darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="relative group overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                New Booking
              </span>
            </button>
          </div>
        </div>

        {/* Bookings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`${darkMode ? 'bg-slate-900/50' : 'bg-white'} rounded-2xl p-6 animate-pulse border ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className={`h-4 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded w-3/4 mb-4`}></div>
                <div className={`h-3 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded w-1/2 mb-3`}></div>
                <div className={`h-3 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded w-2/3 mb-3`}></div>
                <div className={`h-10 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded w-full mt-4`}></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking, index) => (
              <div
                key={booking.id}
                className={`group relative overflow-hidden rounded-2xl ${darkMode ? 'bg-slate-900/50' : 'bg-white'} backdrop-blur-sm border ${darkMode ? 'border-slate-800' : 'border-slate-200'} hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setSelectedBooking(booking)}
              >
                {/* Gradient Border Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${getStatusColor(booking.status)} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(booking.status)} text-white text-xs font-semibold shadow-lg`}>
                    {booking.status}
                  </div>
                </div>

                <div className="relative p-6">
                  {/* Station Info */}
                  <div className="mb-4">
                    <h3 className={`font-bold text-xl mb-2 ${darkMode ? 'text-white' : 'text-slate-900'} group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${getStatusColor(booking.status)} transition-all`}>
                      {booking.stationName}
                    </h3>
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                      <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {booking.stationId}
                      </span>
                    </div>
                  </div>

                  {/* Customer & Vehicle */}
                  <div className={`mb-4 p-3 rounded-xl ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-600'}`}>Customer</span>
                      <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{booking.customerName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-600'}`}>Vehicle</span>
                      <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{booking.vehicleModel}</span>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${getStatusColor(booking.status)}`}>
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-600'}`}>Date</p>
                        <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          {new Date(booking.reservationDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${getStatusColor(booking.status)}`}>
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-600'}`}>Time Slot</p>
                        <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          {booking.startTime} - {booking.endTime}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Charger Type & Rating */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getChargerIcon(booking.chargerType)}
                      <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {booking.chargerType}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {booking.rating}
                      </span>
                    </div>
                  </div>

                  {/* Energy & Cost for Completed */}
                  {booking.status === 'Completed' && (
                    <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-600'}`}>Energy</p>
                          <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            {booking.energyConsumed} kWh
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-600'}`}>Cost</p>
                          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                            ${booking.cost}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setSelectedBooking(null)}
          ></div>
          <div className={`relative ${darkMode ? 'bg-slate-900' : 'bg-white'} rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn border ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className={`sticky top-0 ${darkMode ? 'bg-slate-900' : 'bg-white'} z-10 p-6 border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Booking Details
                </h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className={`p-2 rounded-xl ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} transition-colors`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* Station Banner */}
              <div className={`mb-6 p-6 rounded-2xl bg-gradient-to-r ${getStatusColor(selectedBooking.status)}`}>
                <h3 className="text-2xl font-bold text-white mb-2">{selectedBooking.stationName}</h3>
                <div className="flex items-center gap-2 text-white/90">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Station {selectedBooking.stationId} • Slot {selectedBooking.slotId}</span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-600'} mb-1`}>Customer</p>
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedBooking.customerName}</p>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-600'} mb-1`}>Vehicle</p>
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedBooking.vehicleModel}</p>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-600'} mb-1`}>Date</p>
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {new Date(selectedBooking.reservationDate).toLocaleDateString()}
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-600'} mb-1`}>Time</p>
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {selectedBooking.startTime} - {selectedBooking.endTime}
                  </p>
                </div>
              </div>

              {/* Charging Summary */}
              {selectedBooking.status === 'Completed' && (
                <div className={`p-6 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
                  <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Charging Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Energy</p>
                      <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {selectedBooking.energyConsumed} <span className="text-lg">kWh</span>
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Cost</p>
                      <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                        ${selectedBooking.cost}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                {selectedBooking.status === 'Pending' && (
                  <>
                    <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all">
                      Confirm Booking
                    </button>
                    <button className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all">
                      Cancel
                    </button>
                  </>
                )}
                {selectedBooking.status === 'Confirmed' && (
                  <button className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all">
                    Start Session
                  </button>
                )}
                {selectedBooking.status === 'Completed' && (
                  <button className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
                    Download Receipt
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Booking Modal */}
      {showCreateModal && (
        <CreateBookingModal onClose={() => setShowCreateModal(false)} darkMode={darkMode} />
      )}
    </div>
  );
};

// Create Booking Modal Component
const CreateBookingModal = ({ onClose, darkMode }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    stationId: '',
    slotId: '',
    date: '',
    startTime: '',
    endTime: '',
    chargerType: 'AC'
  });

  const stations = [
    { id: 'ST001', name: 'Downtown Charging Hub', address: '123 Main St', available: 8, rating: 4.8 },
    { id: 'ST002', name: 'Mall Parking Station', address: '456 Shopping Ave', available: 5, rating: 4.5 },
    { id: 'ST003', name: 'Airport Express Charge', address: '789 Airport Rd', available: 12, rating: 5.0 }
  ];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      <div className={`relative ${darkMode ? 'bg-slate-900' : 'bg-white'} rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slideUp border ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        {/* Animated Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">Create New Booking</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    step >= s ? 'bg-white text-blue-600 scale-110' : 'bg-white/30 text-white'
                  }`}>
                    {step > s ? <Check className="w-6 h-6" /> : s}
                  </div>
                  {s < 4 && (
                    <div className={`flex-1 h-2 mx-2 rounded-full transition-all duration-300 ${
                      step > s ? 'bg-white' : 'bg-white/30'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-white text-sm font-medium">
              <span className={step === 1 ? 'font-bold' : 'opacity-70'}>Station</span>
              <span className={step === 2 ? 'font-bold' : 'opacity-70'}>Date & Time</span>
              <span className={step === 3 ? 'font-bold' : 'opacity-70'}>Slot</span>
              <span className={step === 4 ? 'font-bold' : 'opacity-70'}>Confirm</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 300px)' }}>
          {/* Step 1: Select Station */}
          {step === 1 && (
            <div className="animate-fadeIn space-y-4">
              <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Choose Your Charging Station
              </h3>
              {stations.map((station) => (
                <div
                  key={station.id}
                  onClick={() => setFormData({ ...formData, stationId: station.id })}
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    formData.stationId === station.id
                      ? `border-blue-500 ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'} scale-105`
                      : `${darkMode ? 'border-slate-700 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300'}`
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {station.name}
                      </h4>
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                        <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          {station.address}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            {station.rating}
                          </span>
                        </div>
                        <div className={`px-3 py-1 rounded-full ${darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'} text-sm font-semibold`}>
                          {station.available} slots available
                        </div>
                      </div>
                    </div>
                    <div className={`p-4 rounded-xl ${formData.stationId === station.id ? 'bg-blue-500' : darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <Zap className={`w-8 h-8 ${formData.stationId === station.id ? 'text-white' : darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 2 && (
            <div className="animate-fadeIn">
              <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Pick Your Schedule
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Reservation Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-6 py-4 rounded-xl border-2 ${darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-900'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Start Time
                    </label>
                    <select
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className={`w-full px-6 py-4 rounded-xl border-2 ${darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-900'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg`}
                    >
                      <option value="">Select time</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      End Time
                    </label>
                    <select
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className={`w-full px-6 py-4 rounded-xl border-2 ${darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-900'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg`}
                    >
                      <option value="">Select time</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Charger Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setFormData({ ...formData, chargerType: 'AC' })}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                        formData.chargerType === 'AC'
                          ? 'border-emerald-500 bg-emerald-500/10 scale-105'
                          : darkMode ? 'border-slate-700 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Battery className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                      <p className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>AC Charging</p>
                      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Standard • 7-22 kW</p>
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, chargerType: 'DC Fast' })}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                        formData.chargerType === 'DC Fast'
                          ? 'border-orange-500 bg-orange-500/10 scale-105'
                          : darkMode ? 'border-slate-700 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Zap className="w-12 h-12 mx-auto mb-3 text-orange-500" />
                      <p className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>DC Fast</p>
                      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Rapid • 50-350 kW</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Select Slot */}
          {step === 3 && (
            <div className="animate-fadeIn">
              <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Choose Your Slot
              </h3>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((slot) => {
                  const isAvailable = slot !== 3 && slot !== 6;
                  const isSelected = formData.slotId === `SL00${slot}`;
                  return (
                    <button
                      key={slot}
                      disabled={!isAvailable}
                      onClick={() => isAvailable && setFormData({ ...formData, slotId: `SL00${slot}` })}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10 scale-105'
                          : isAvailable
                          ? darkMode ? 'border-slate-700 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300'
                          : darkMode ? 'border-slate-800 bg-slate-800/50 opacity-50' : 'border-slate-100 bg-slate-100 opacity-50'
                      } ${!isAvailable && 'cursor-not-allowed'}`}
                    >
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center ${
                        isSelected
                          ? 'bg-blue-500'
                          : isAvailable
                          ? darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
                          : darkMode ? 'bg-slate-700' : 'bg-slate-200'
                      }`}>
                        {isAvailable ? (
                          <Zap className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                        ) : (
                          <X className={`w-8 h-8 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                        )}
                      </div>
                      <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>Slot {slot}</p>
                      <p className={`text-sm mt-1 ${
                        isAvailable ? 'text-emerald-500 font-semibold' : darkMode ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        {isAvailable ? 'Available' : 'Occupied'}
                      </p>
                    </button>
                  );
                })}
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    Your selected slot will be reserved for {formData.startTime} - {formData.endTime}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Confirm */}
          {step === 4 && (
            <div className="animate-fadeIn">
              <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Review Your Booking
              </h3>
              
              <div className={`p-6 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-gradient-to-br from-slate-50 to-slate-100'} space-y-4 mb-6`}>
                <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                  <span className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Station</span>
                  <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {stations.find(s => s.id === formData.stationId)?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                  <span className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Date</span>
                  <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {formData.date && new Date(formData.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                  <span className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Time</span>
                  <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {formData.startTime} - {formData.endTime}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                  <span className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Charger Type</span>
                  <span className={`font-bold text-lg flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {formData.chargerType === 'AC' ? (
                      <Battery className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Zap className="w-5 h-5 text-orange-500" />
                    )}
                    {formData.chargerType}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Slot</span>
                  <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {formData.slotId}
                  </span>
                </div>
                <div className={`pt-4 mt-4 border-t-2 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-lg font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Estimated Cost</span>
                    <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                      $18.50
                    </span>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-xl ${darkMode ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-amber-50 border border-amber-200'}`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className={`text-sm ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                    <p className="font-semibold mb-2">Booking Policy</p>
                    <ul className="space-y-1">
                      <li>• Free cancellation up to 12 hours before</li>
                      <li>• Grace period: 15 minutes after start time</li>
                      <li>• Unused time is non-refundable</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'} p-6`}>
          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={prevStep}
                className={`px-8 py-3 rounded-xl border-2 ${darkMode ? 'border-slate-700 text-white hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-50'} font-semibold transition-all`}
              >
                Previous
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={nextStep}
                disabled={
                  (step === 1 && !formData.stationId) ||
                  (step === 2 && (!formData.date || !formData.startTime || !formData.endTime)) ||
                  (step === 3 && !formData.slotId)
                }
                className="flex-1 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold hover:shadow-xl hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={() => {
                  alert('Booking confirmed! You will receive a confirmation email shortly.');
                  onClose();
                }}
                className="flex-1 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold hover:shadow-xl hover:shadow-emerald-500/50 transition-all"
              >
                Confirm Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom Styles
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.4s ease-out forwards;
  }

  .animate-slideUp {
    animation: slideUp 0.4s ease-out forwards;
  }

  .animate-scaleIn {
    animation: scaleIn 0.3s ease-out forwards;
  }

  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #2563eb, #7c3aed);
  }
`;

export default function App() {
  return (
    <>
      <style>{styles}</style>
      <BookingManagement />
    </>
  );
}