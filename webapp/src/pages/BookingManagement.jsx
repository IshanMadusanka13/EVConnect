import React, { useState, useEffect, useContext } from 'react';
import {
  Calendar, Clock, MapPin, Search, Filter, Plus, X, ChevronDown, Bell, Star, ChevronRight,
  Zap, Battery, Navigation, TrendingUp, Activity, Check, AlertCircle, User
} from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';

const BookingManagement = () => {
  const { darkMode, getColor } = useContext(ThemeContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [energyInput, setEnergyInput] = useState('');
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [stationsLookup, setStationsLookup] = useState({});
  const [evOwnersLookup, setEvOwnersLookup] = useState({});
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    revenue: 0
  });

  const closeModal = () => {
    setSelectedBooking(null);
    setEnergyInput('');
  };

  useEffect(() => {
    fetchStations();
    fetchEVOwners();
    fetchBookings();
  }, []);

  const fetchStations = async () => {
    try {
      const data = await api.getAllStation();
      const lookup = {};
      data.forEach(station => {
        lookup[station.id] = station;
      });
      setStationsLookup(lookup);
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  };

  const fetchEVOwners = async () => {
    try {
      const data = await api.getAllEVOwners();
      const lookup = {};
      data.forEach(owner => {
        lookup[owner.nic] = owner;
      });
      setEvOwnersLookup(lookup);
    } catch (error) {
      console.error('Error fetching EV owners:', error);
    }
  };

  const getStationName = (stationId) => {
    return stationsLookup[stationId]?.stationName || stationId || 'Unknown Station';
  };

  const getStation = (stationId) => {
    return stationsLookup[stationId] || stationId || 'Unknown Station';
  };

  const getEVOwner = (nic) => {
    return evOwnersLookup[nic] || null;
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await api.getAllBookings();
      setBookings(data);

      // Calculate real stats
      const totalBookings = data.length;
      const activeBookings = data.filter(b => b.status === 'In Progress').length;
      const pendingBookings = data.filter(b => b.status === 'Pending').length;
      const totalRevenue = data
        .filter(b => b.status === 'Completed')
        .reduce((sum, b) => sum + (parseFloat(b.cost) || 0), 0);

      setStats({
        total: totalBookings,
        active: activeBookings,
        pending: pendingBookings,
        revenue: totalRevenue.toFixed(2)
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      alert('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterBookings();
  }, [bookings, filters]);

  const filterBookings = () => {
    let filtered = [...bookings];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(b =>
        b.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(b => {
        const stationName = getStationName(b.stationId).toLowerCase();
        return (
          stationName.includes(searchLower) ||
          b.customerName?.toLowerCase().includes(searchLower) ||
          b.vehicleModel?.toLowerCase().includes(searchLower) ||
          b.id?.toString().toLowerCase().includes(searchLower) ||
          b.stationId?.toLowerCase().includes(searchLower) ||
          b.nic?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter(b => {
        const bookingDate = new Date(b.reservationDate);
        bookingDate.setHours(0, 0, 0, 0);

        switch (filters.dateRange) {
          case 'today':
            return bookingDate.getTime() === today.getTime();
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            return bookingDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(today.getMonth() - 1);
            return bookingDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredBookings(filtered);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await api.cancelBooking(bookingId, {
        cancelledBy: 'User', // You can get this from auth context
        cancellationReason: 'User requested cancellation'
      });
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      alert(error.message || 'Failed to cancel booking');
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      await api.updateBookingStatus(bookingId, 'Approved');
      alert('Booking approved successfully');
      fetchBookings();
      closeModal();
    } catch (error) {
      alert(error.message || 'Failed to approve booking');
    }
  };

  const handleRejectBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to reject this booking?')) return;

    try {
      await api.updateBookingStatus(bookingId, 'Rejected');
      alert('Booking rejected successfully');
      fetchBookings();
      closeModal();
    } catch (error) {
      alert(error.message || 'Failed to reject booking');
    }
  };

  const handleStartSession = async (bookingId) => {
    try {
      await api.scanQRCode(bookingId);
      await api.updateBookingStatus(bookingId, 'In Progress');
      alert('Session started successfully');
      fetchBookings();
      closeModal();
    } catch (error) {
      alert(error.message || 'Failed to start session');
    }
  };

  const handleCompleteSession = async (bookingId) => {
    if (!energyInput || parseFloat(energyInput) <= 0) {
      alert('Please enter a valid energy amount');
      return;
    }

    try {
      const rateData = await api.getChargingRate(bookingId);
      const cost = parseFloat(energyInput) * parseFloat(rateData.chargingRate);

      await api.updateEnergyAndCost(bookingId, parseFloat(energyInput), cost);
      await api.updateBookingStatus(bookingId, 'Completed');
      alert(`Session completed successfully! Cost: Rs.${cost.toFixed(2)} (${energyInput} kWh × $${rateData.chargingRate}/kWh)`);
      setEnergyInput('');
      fetchBookings();
      closeModal();
    } catch (error) {
      alert(error.message || 'Failed to complete session');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
      case 'Approved': return getColor('status.confirmed');
      case 'Pending': return getColor('status.pending');
      case 'Completed': return getColor('status.completed');
      case 'Cancelled':
      case 'Rejected': return getColor('status.cancelled');
      default: return getColor('status.default');
    }
  };

  const getChargerIcon = (type) => {
    return type === 'DC' ?
      <Zap className={`w-5 h-5 ${getColor('charger.dc')}`} /> :
      <Battery className={`w-5 h-5 ${getColor('charger.ac')}`} />;
  };

  const generateReceiptPDF = (booking) => {
    const doc = new jsPDF();

    const stationName = getStationName(booking.stationId);
    const stationInfo = stationsLookup[booking.stationId];
    const ownerInfo = getEVOwner(booking.nic);

    // Enhanced color palette
    const brand = {
      primary: [59, 130, 246],
      secondary: [168, 85, 247],
      accent: [14, 165, 233],
      success: [16, 185, 129],
      dark: [15, 23, 42],
      medium: [100, 116, 139],
      light: [148, 163, 184],
      bg: [249, 250, 251],
      white: [255, 255, 255]
    };

    const pageWidth = 210;
    const centerX = pageWidth / 2;

    // ========== HEADER SECTION ==========
    // Main gradient background
    doc.setFillColor(brand.primary[0], brand.primary[1], brand.primary[2]);
    doc.rect(0, 0, pageWidth, 60, 'F');

    // Purple gradient overlay (lighter color for transparency effect)
    doc.setFillColor(200, 170, 240);
    doc.triangle(pageWidth, 0, pageWidth, 60, pageWidth - 80, 60, 'F');

    // Company initials logo
    const logoX = 25, logoY = 15;

    doc.setFillColor(255, 255, 255);
    doc.circle(logoX, logoY, 6, 'F');

    doc.setTextColor(brand.primary[0], brand.primary[1], brand.primary[2]);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('EV', logoX, logoY + 2, { align: 'center' });

    // Company Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont(undefined, 'bold');
    doc.text('EV ChargeHub', 42, 22);

    // Tagline
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text('Powering Your Journey', 42, 29);

    // Decorative lines
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(20, 42, 80, 42);
    doc.line(130, 42, 190, 42);

    // Receipt title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('RECEIPT', centerX, 46, { align: 'center' });

    // ========== RECEIPT INFO BANNER ==========
    let yPos = 70;

    doc.setFillColor(brand.bg[0], brand.bg[1], brand.bg[2]);
    doc.roundedRect(15, yPos, 180, 22, 3, 3, 'F');

    // Left accent line
    doc.setDrawColor(brand.primary[0], brand.primary[1], brand.primary[2]);
    doc.setLineWidth(2);
    doc.line(20, yPos + 5, 20, yPos + 17);

    doc.setTextColor(brand.medium[0], brand.medium[1], brand.medium[2]);
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text('RECEIPT ID', 25, yPos + 8);

    doc.setTextColor(brand.dark[0], brand.dark[1], brand.dark[2]);
    doc.setFontSize(11);
    doc.text(`#${booking.id.substring(0, 8).toUpperCase()}`, 25, yPos + 15);

    // Right accent line
    doc.setDrawColor(brand.secondary[0], brand.secondary[1], brand.secondary[2]);
    doc.line(125, yPos + 5, 125, yPos + 17);

    doc.setTextColor(brand.medium[0], brand.medium[1], brand.medium[2]);
    doc.setFontSize(8);
    doc.text('ISSUED DATE', 130, yPos + 8);

    doc.setTextColor(brand.dark[0], brand.dark[1], brand.dark[2]);
    doc.setFontSize(11);
    const issueDate = new Date(booking.bookingDateTime || new Date()).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
    doc.text(issueDate, 130, yPos + 15);

    // ========== STATION INFORMATION ==========
    yPos = 102;

    doc.setFillColor(brand.primary[0], brand.primary[1], brand.primary[2]);
    doc.roundedRect(15, yPos, 180, 10, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('CHARGING STATION', 20, yPos + 7);

    yPos += 15;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(brand.light[0], brand.light[1], brand.light[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, yPos, 180, 35, 2, 2, 'FD');

    yPos += 8;
    doc.setTextColor(brand.dark[0], brand.dark[1], brand.dark[2]);
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.text(stationName, 20, yPos);

    yPos += 8;
    const stationGrid = [
      ['Address:', stationInfo?.address || 'N/A'],
      ['Station ID:', booking.stationId],
      ['Slot:', booking.slotId]
    ];

    doc.setFontSize(9);
    stationGrid.forEach(([label, value]) => {
      doc.setFont(undefined, 'normal');
      doc.setTextColor(brand.medium[0], brand.medium[1], brand.medium[2]);
      doc.text(label, 20, yPos);

      doc.setFont(undefined, 'bold');
      doc.setTextColor(brand.dark[0], brand.dark[1], brand.dark[2]);
      doc.text(value, 75, yPos);
      yPos += 6;
    });

    // ========== CHARGING SESSION ==========
    yPos = 157;

    doc.setFillColor(brand.secondary[0], brand.secondary[1], brand.secondary[2]);
    doc.roundedRect(15, yPos, 180, 10, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('SESSION DETAILS', 20, yPos + 7);

    yPos += 15;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(brand.light[0], brand.light[1], brand.light[2]);
    doc.roundedRect(15, yPos, 180, 40, 2, 2, 'FD');

    yPos += 8;
    const sessionGrid = [
      ['Date:', new Date(booking.reservationDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })],
      ['Start Time:', booking.startTime],
      ['End Time:', booking.endTime],
      ['Charger Type:', booking.chargerType || 'AC'],
      ['Customer:', `${ownerInfo.firstName} ${ownerInfo.lastName}` || 'N/A'],
      ['Vehicle:', `${ownerInfo.vehicleModel}` || 'N/A']
    ];

    doc.setFontSize(9);
    sessionGrid.forEach(([label, value]) => {
      doc.setFont(undefined, 'normal');
      doc.setTextColor(brand.medium[0], brand.medium[1], brand.medium[2]);
      doc.text(label, 20, yPos);

      doc.setFont(undefined, 'bold');
      doc.setTextColor(brand.dark[0], brand.dark[1], brand.dark[2]);
      doc.text(String(value), 75, yPos);
      yPos += 6;
    });

    // ========== BILLING SUMMARY ==========
    yPos = 217;

    doc.setFillColor(brand.primary[0], brand.primary[1], brand.primary[2]);
    doc.roundedRect(15, yPos, 180, 45, 3, 3, 'F');

    // Lighter overlay for gradient effect
    doc.setFillColor(200, 170, 240);
    doc.roundedRect(100, yPos, 95, 45, 3, 3, 'F');

    yPos += 10;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('BILLING SUMMARY', centerX, yPos, { align: 'center' });

    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.3);
    doc.line(30, yPos + 3, 180, yPos + 3);

    yPos += 12;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Energy Consumed', 25, yPos);

    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(`${booking.energyConsumed || 0} kWh`, 185, yPos, { align: 'right' });

    yPos += 14;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text('Total Amount', 25, yPos);

    doc.setFontSize(26);
    doc.setFont(undefined, 'bold');
    doc.text(`Rs.${(booking.cost || 0).toFixed(2)}`, 185, yPos, { align: 'right' });

    // ========== STATUS BADGE ==========
    yPos = 270;

    let statusColor, statusText;
    switch (booking.status) {
      case 'Completed':
        statusColor = brand.success;
        statusText = 'COMPLETED';
        break;
      case 'Approved':
        statusColor = brand.primary;
        statusText = 'APPROVED';
        break;
      case 'Pending':
        statusColor = [251, 191, 36];
        statusText = 'PENDING';
        break;
      case 'Cancelled':
        statusColor = [239, 68, 68];
        statusText = 'CANCELLED';
        break;
      default:
        statusColor = brand.medium;
        statusText = booking.status;
    }

    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.roundedRect(60, yPos, 90, 12, 6, 6, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(statusText, centerX, yPos + 8, { align: 'center' });

    // ========== FOOTER ==========
    yPos = 285;

    doc.setDrawColor(brand.light[0], brand.light[1], brand.light[2]);
    doc.setLineWidth(0.3);
    doc.line(15, yPos, 195, yPos);

    yPos += 5;
    doc.setTextColor(brand.dark[0], brand.dark[1], brand.dark[2]);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Thank you for charging with us!', centerX, yPos, { align: 'center' });

    yPos += 6;
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(brand.medium[0], brand.medium[1], brand.medium[2]);
    doc.text('Together, we\'re building a sustainable future', centerX, yPos, { align: 'center' });

    yPos += 7;
    doc.setFontSize(7);
    doc.text('support@evchargehub.com  |  +1 (555) 123-4567  |  www.evchargehub.com', centerX, yPos, { align: 'center' });

    yPos += 4;
    doc.setFontSize(6);
    doc.setTextColor(brand.light[0], brand.light[1], brand.light[2]);
    doc.text(`Generated: ${new Date().toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, centerX, yPos, { align: 'center' });

    const fileName = `EVChargeHub_Receipt_${booking.id.substring(0, 8)}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${getColor('background.primary')}`}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-blue-600' : 'bg-blue-400'} animate-pulse`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-purple-600' : 'bg-purple-400'} animate-pulse`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 ${darkMode ? 'bg-pink-600' : 'bg-pink-400'} animate-pulse`} style={{ animationDelay: '2s' }}></div>
      </div>

      <Navbar />

      {/* Main Content */}
      <div className="relative pt-24 pb-8 px-4 max-w-7xl mx-auto">
        {/* Header with Gradient */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className={`px-3 py-1 rounded-full ${getColor('background.accent')} ${getColor('text.accent')} text-sm font-medium`}>
              Dashboard
            </div>
            <ChevronRight className={`w-4 h-4 ${getColor('text.tertiary')}`} />
            <div className={`px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 text-sm font-medium`}>
              Bookings
            </div>
          </div>
          <h1 className={`text-4xl font-bold mb-2 ${getColor('text.primary')}`}>
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">Bookings</span>
          </h1>
          <p className={`text-lg ${getColor('text.secondary')}`}>
            Manage all your EV charging reservations in one place
          </p>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Bookings', value: stats.total.toString(), change: '+12%', icon: Calendar, gradient: 'from-blue-500 to-cyan-500' },
            { label: 'Active Sessions', value: stats.active.toString(), change: `${stats.active > 0 ? '+' : ''}${stats.active}`, icon: Activity, gradient: 'from-emerald-500 to-teal-500' },
            { label: 'Pending', value: stats.pending.toString(), change: `${stats.pending}`, icon: Clock, gradient: 'from-amber-500 to-orange-500' },
            { label: 'Revenue', value: `Rs.${stats.revenue}`, change: '+18%', icon: TrendingUp, gradient: 'from-purple-500 to-pink-500' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-2xl ${getColor('background.card')} backdrop-blur-sm border ${getColor('border.primary')} p-6 hover:scale-105 transition-all duration-300 cursor-pointer`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {/* <span className={`text-sm font-semibold ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                      {stat.change}
                    </span> */}
                  </div>
                  <p className={`text-sm ${getColor('text.secondary')} mb-1`}>{stat.label}</p>
                  <p className={`text-3xl font-bold ${getColor('text.primary')}`}>{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters Section */}
        <div className={`${getColor('background.card')} backdrop-blur-sm rounded-2xl border ${getColor('border.primary')} p-6 mb-6`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${getColor('text.tertiary')}`} />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className={`pl-12 pr-4 py-3 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full md:w-80`}
                  placeholder-className={darkMode ? 'placeholder-slate-500' : 'placeholder-slate-400'}
                />
              </div>

              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className={`w-40 px-4 py-3 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="In Progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className={`w-40 px-4 py-3 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
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
              <div key={i} className={`${getColor('background.card')} rounded-2xl p-6 animate-pulse border ${getColor('border.primary')}`}>
                <div className={`h-4 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded w-3/4 mb-4`}></div>
                <div className={`h-3 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded w-1/2 mb-3`}></div>
                <div className={`h-3 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded w-2/3 mb-3`}></div>
                <div className={`h-10 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded w-full mt-4`}></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {filteredBookings.length === 0 && (
              <div className={`text-center py-12 ${getColor('background.card')} rounded-2xl border ${getColor('border.primary')}`}>
                <Search className={`w-16 h-16 mx-auto mb-4 ${getColor('text.tertiary')}`} />
                <h3 className={`text-xl font-bold mb-2 ${getColor('text.primary')}`}>
                  No bookings found
                </h3>
                <p className={`${getColor('text.secondary')}`}>
                  {filters.search || filters.status !== 'all' || filters.dateRange !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first booking to get started'}
                </p>
              </div>
            )}

            {filteredBookings.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBookings.map((booking, index) => (
                  <div
                    key={booking.id}
                    className={`group relative overflow-hidden rounded-2xl ${getColor('background.card')} backdrop-blur-sm border ${getColor('border.primary')} hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer`}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => setSelectedBooking(booking)}
                  >
                    {/* Gradient Border Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${getStatusColor(booking.status)} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>

                    {/* Status Badge */}
                    <div className="absolute top-6 right-4 z-10">
                      <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(booking.status)} text-white text-xs font-semibold shadow-lg`}>
                        {booking.status}
                      </div>
                    </div>

                    <div className="relative p-6 mb-4">
                      {/* Station Info */}
                      <div className="mb-4">
                        <h3 className={`font-bold text-xl mb-2 ${getColor('text.primary')} group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${getStatusColor(booking.status)} transition-all`}>
                          {getStationName(booking.stationId)}
                        </h3>
                        <div className="flex items-center gap-2">
                          <MapPin className={`w-4 h-4 ${getColor('text.secondary')}`} />
                          <span className={`text-sm ${getColor('text.secondary')}`}>
                            {booking.stationId}
                          </span>
                        </div>
                      </div>

                      {/* Customer & Vehicle */}
                      <div className={`mb-4 p-3 rounded-xl ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs ${getColor('text.tertiary')}`}>Customer</span>
                          <span className={`text-sm font-semibold ${getColor('text.primary')}`}>
                            {(() => {
                              const owner = getEVOwner(booking.nic);
                              return owner ? `${owner.firstName} ${owner.lastName}` : booking.customerName;
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs ${getColor('text.tertiary')}`}>NIC</span>
                          <span className={`text-sm font-semibold ${getColor('text.primary')}`}>{booking.nic || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${getColor('text.tertiary')}`}>Vehicle</span>
                          <span className={`text-sm font-semibold ${getColor('text.primary')}`}>
                            {(() => {
                              const owner = getEVOwner(booking.nic);
                              return owner ? owner.vehicleModel : booking.vehicleModel;
                            })()}
                          </span>
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${getStatusColor(booking.status)}`}>
                            <Calendar className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className={`text-xs ${getColor('text.tertiary')}`}>Date</p>
                            <p className={`text-sm font-semibold ${getColor('text.primary')}`}>
                              {new Date(booking.reservationDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${getStatusColor(booking.status)}`}>
                            <Clock className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className={`text-xs ${getColor('text.tertiary')}`}>Time Slot</p>
                            <p className={`text-sm font-semibold ${getColor('text.primary')}`}>
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
                          <span className={`text-sm font-semibold ${getColor('text.primary')}`}>
                            {booking.rating}
                          </span>
                        </div>
                      </div>

                      {/* Energy & Cost for Completed */}
                      {booking.status === 'Completed' && (
                        <div className={`mt-4 pt-4 border-t ${getColor('border.primary')}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`text-xs ${getColor('text.tertiary')}`}>Energy</p>
                              <p className={`text-lg font-bold ${getColor('text.primary')}`}>
                                {booking.energyConsumed} kWh
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-xs ${getColor('text.tertiary')}`}>Cost</p>
                              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                                Rs.{booking.cost}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Hover Arrow */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className={`w-5 h-5 ${getColor('text.secondary')}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )
        }
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={closeModal}
          ></div>
          <div className={`relative ${getColor('background.modal')} rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn border ${getColor('border.primary')}`}>
            <div className={`sticky top-0 ${getColor('background.modal')} z-10 p-6 border-b ${getColor('border.primary')}`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-2xl font-bold ${getColor('text.primary')}`}>
                  Booking Details
                </h2>
                <button
                  onClick={closeModal}
                  className={`p-2 rounded-xl ${getColor('hover.primary')} transition-colors`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* Station Banner */}
              <div className={`mb-6 p-6 rounded-2xl bg-gradient-to-r ${getStatusColor(selectedBooking.status)}`}>
                <h3 className="text-2xl font-bold text-white mb-2">{getStationName(selectedBooking.stationId) || 'Station Name'}</h3>
                <div className="flex items-center gap-2 text-white/90">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Station {selectedBooking.stationId} • Slot {selectedBooking.slotId}</span>
                </div>
              </div>

              {/* EV Owner Details Section - UPDATED WITH CORRECT FIELD NAMES */}
              {(() => {
                const owner = getEVOwner(selectedBooking.nic);
                return owner ? (
                  <div className={`mb-6 p-6 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-blue-900/20 to-purple-900/20' : 'bg-gradient-to-br from-blue-50 to-purple-50'} border-2 border-blue-500/30`}>
                    <h4 className={`text-lg font-bold mb-4 ${getColor('text.primary')} flex items-center gap-2`}>
                      <User className="w-5 h-5 text-blue-500" />
                      EV Owner Details
                    </h4>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                        {owner.firstName?.charAt(0)}{owner.lastName?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h5 className={`text-xl font-bold ${getColor('text.primary')} mb-1`}>
                          {owner.firstName} {owner.lastName}
                        </h5>
                        <p className={`text-sm ${getColor('text.secondary')} mb-2`}>{owner.email || 'N/A'}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                            {owner.isActive ? 'Active Account' : 'Inactive Account'}
                          </span>
                          {owner.Gender && (
                            <span className={`px-3 py-1 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'} text-xs font-semibold ${getColor('text.primary')}`}>
                              {owner.gender}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-white'}`}>
                        <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>NIC Number</p>
                        <p className={`font-semibold ${getColor('text.primary')}`}>{owner.nic}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-white'}`}>
                        <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>Phone</p>
                        <p className={`font-semibold ${getColor('text.primary')}`}>{owner.phoneNumber || 'N/A'}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-white'}`}>
                        <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>Vehicle Model</p>
                        <p className={`font-semibold ${getColor('text.primary')}`}>{owner.vehicleModel || 'N/A'}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-white'}`}>
                        <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>Plate Number</p>
                        <p className={`font-semibold ${getColor('text.primary')}`}>{owner.vehiclePlateNumber || 'N/A'}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-white'}`}>
                        <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>Battery Capacity</p>
                        <p className={`font-semibold ${getColor('text.primary')}`}>{owner.batteryCapacity || 'N/A'}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-white'}`}>
                        <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>Compatible Chargers</p>
                        <p className={`font-semibold ${getColor('text.primary')}`}>{owner.compatibleChargerTypes || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>Date</p>
                  <p className={`font-semibold ${getColor('text.primary')}`}>
                    {new Date(selectedBooking.reservationDate).toLocaleDateString()}
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>Time</p>
                  <p className={`font-semibold ${getColor('text.primary')}`}>
                    {selectedBooking.startTime} - {selectedBooking.endTime}
                  </p>
                </div>
              </div>

              {/* QR Code Display */}
              {(selectedBooking.status === 'Approved') && selectedBooking.qrCodeData && (
                <div className={`mb-6 p-6 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'} text-center`}>
                  <h3 className={`font-bold mb-4 ${getColor('text.primary')}`}>QR Code</h3>
                  <div className="bg-white p-6 rounded-xl inline-block shadow-lg">
                    <div className="flex justify-center items-center">
                      <QRCodeSVG
                        value={selectedBooking.qrCodeData}
                        size={200}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <p className={`text-sm mt-4 font-semibold text-center ${darkMode ? 'text-slate-700' : 'text-slate-600'}`}>
                      Booking ID: {selectedBooking.id}
                    </p>
                  </div>
                  <p className={`text-xs mt-3 ${getColor('text.tertiary')}`}>Show this code to station operator</p>
                  {selectedBooking.qrCodeScanned && (
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <Check className="w-5 h-5 text-emerald-500" />
                      <p className="text-emerald-500 font-semibold">QR Code Scanned</p>
                    </div>
                  )}
                </div>
              )}

              {/* Charging Summary */}
              {selectedBooking.status === 'Completed' && (
                <div className={`p-6 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
                  <h3 className={`font-bold mb-4 ${getColor('text.primary')}`}>Charging Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm ${getColor('text.secondary')}`}>Energy</p>
                      <p className={`text-3xl font-bold ${getColor('text.primary')}`}>
                        {selectedBooking.energyConsumed} <span className="text-lg">kWh</span>
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${getColor('text.secondary')}`}>Cost</p>
                      <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                        Rs.{selectedBooking.cost}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedBooking.status === 'In Progress' && (
                <div className={`mb-6 p-6 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-gradient-to-br from-emerald-50 to-teal-50'}`}>
                  <h3 className={`font-bold mb-4 ${getColor('text.primary')}`}>Complete Charging Session</h3>
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Energy Consumed (kWh)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={energyInput}
                      onChange={(e) => setEnergyInput(e.target.value)}
                      placeholder="Enter energy consumed"
                      className={`w-full px-6 py-4 rounded-xl border-2 ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-lg`}
                    />
                    <p className={`text-xs mt-2 ${getColor('text.tertiary')}`}>
                      Enter the total energy consumed during this charging session
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                {selectedBooking.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleApproveBooking(selectedBooking.id)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all">
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectBooking(selectedBooking.id)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all">
                      Reject
                    </button>
                  </>
                )}
                {/* {selectedBooking.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleConfirmBooking(selectedBooking.id)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all">
                      Confirm Booking
                    </button>
                    <button
                      onClick={() => handleCancelBooking(selectedBooking.id)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all">
                      Cancel
                    </button>
                  </>
                )} */}
                {selectedBooking.status === 'Approved' && (
                  <>
                    <button
                      onClick={() => handleStartSession(selectedBooking.id)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all">
                      Start Session
                    </button>
                    <button
                      onClick={() => handleCancelBooking(selectedBooking.id)}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all">
                      Cancel
                    </button>
                  </>
                )}
                {selectedBooking.status === 'In Progress' && (
                  <button
                    onClick={() => handleCompleteSession(selectedBooking.id)}
                    disabled={!energyInput || parseFloat(energyInput) <= 0}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    Complete Session
                  </button>
                )}
                {selectedBooking.status === 'Completed' && (
                  <button
                    onClick={() => generateReceiptPDF(selectedBooking)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
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
        <CreateBookingModal
          onClose={() => setShowCreateModal(false)}
          stationsLookup={stationsLookup}
          getStation={getStation}
        />
      )}
    </div>
  );
};

// Create Booking Modal Component
const CreateBookingModal = ({ onClose, stationsLookup, getStation }) => {
  const { darkMode, getColor } = useContext(ThemeContext);
  const [step, setStep] = useState(1);
  const [stations, setStations] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evOwner, setEvOwner] = useState(null);
  const [nicInput, setNicInput] = useState('');
  const [nicError, setNicError] = useState('');
  const [formData, setFormData] = useState({
    stationId: '',
    slotId: '',
    date: '',
    startTime: '',
    endTime: '',
    chargerType: 'AC'
  });

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const data = await api.getAllStation();
      setStations(data);
    } catch (error) {
      console.error('Error fetching stations:', error);
      alert('Failed to load stations');
    }
  };

  const handleSearchEVOwner = async () => {
    if (!nicInput.trim()) {
      setNicError('Please enter a NIC number');
      return;
    }

    try {
      setLoading(true);
      setNicError('');
      const owner = await api.getEVOwnerByNIC(nicInput.trim());

      if (!owner.isActive) {
        setNicError('This EV Owner profile is deactivated. Please contact support to activate your account.');
        setEvOwner(null);
        return;
      }

      setEvOwner(owner);
      setNicError('');
    } catch (error) {
      console.error('Error fetching EV Owner:', error);
      setNicError(error.message || 'EV Owner not found. Please check the NIC number.');
      setEvOwner(null);
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    if (!formData.stationId || !formData.date || !formData.startTime || !formData.endTime) {
      return;
    }

    try {
      setLoading(true);
      const slots = await api.checkAvailability(
        formData.stationId,
        formData.date,
        formData.startTime,
        formData.endTime,
        formData.chargerType
      );
      setAvailableSlots(slots);
      setStep(4); // Move to step 4 (slot selection) after fetching slots
    } catch (error) {
      console.error('Error checking availability:', error);
      alert('Failed to check availability');
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    '08:00:00', '09:00:00', '10:00:00', '11:00:00', '12:00:00', '13:00:00',
    '14:00:00', '15:00:00', '16:00:00', '17:00:00', '18:00:00', '19:00:00', '20:00:00'
  ];

  const nextStep = () => {
    if (step === 1 && evOwner) {
      setStep(2);
    } else if (step === 3) {
      checkAvailability();
    } else if (step < 5) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCreateBooking = async () => {
    try {
      setLoading(true);
      const bookingData = {
        stationId: formData.stationId,
        nic: evOwner.nic,
        reservationDate: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        chargerType: formData.chargerType
      };

      await api.createBooking(bookingData);
      alert('Booking created successfully!');
      onClose();
      window.location.reload();
    } catch (error) {
      alert(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      <div className={`relative ${getColor('background.modal')} rounded-3xl shadow-2xl max-w-2xl w-full max-h-[100vh] overflow-hidden animate-slideUp border ${getColor('border.primary')}`}>
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">Create New Booking</h2>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/20 transition-colors">
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Progress Steps - Updated to 5 steps */}
            <div className="mb-2">
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className="flex items-center flex-1 last:flex-none">
                    <div className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step >= s ? 'bg-white text-blue-600 scale-110' : 'bg-white/30 text-white'
                      }`}>
                      {step > s ? <Check className="w-6 h-6" /> : s}
                    </div>
                    {s < 5 && (
                      <div className={`flex-1 h-2 mx-2 rounded-full transition-all duration-300 ${step > s ? 'bg-white' : 'bg-white/30'
                        }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              {['EV Owner', 'Station', 'Date & Time', 'Slot', 'Confirm'].map((label, idx) => (
                <div key={label} className="flex items-center flex-1 last:flex-none">
                  <span className={`text-white text-sm font-medium w-12 text-center ${step === idx + 1 ? 'font-bold' : 'opacity-70'
                    }`}>
                    {label}
                  </span>
                  {idx < 4 && <div className="flex-1 mx-2"></div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 300px)' }}>
          {/* Step 1: Search EV Owner */}
          {step === 1 && (
            <div className="animate-fadeIn space-y-6">
              <h3 className={`text-2xl font-bold mb-6 ${getColor('text.primary')}`}>
                Find EV Owner
              </h3>

              <div>
                <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  National Identity Card (NIC)
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={nicInput}
                    onChange={(e) => {
                      setNicInput(e.target.value);
                      setNicError('');
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchEVOwner()}
                    placeholder="Enter NIC number (e.g., 123456789V)"
                    className={`flex-1 px-6 py-4 rounded-xl border-2 ${nicError ? 'border-red-500' : getColor('border.input')
                      } ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg`}
                  />
                  <button
                    onClick={handleSearchEVOwner}
                    disabled={loading || !nicInput.trim()}
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold hover:shadow-xl hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
                {nicError && (
                  <div className="mt-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-500 font-medium">{nicError}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* EV Owner Profile Display */}
              {evOwner && (
                <div className={`mt-6 p-6 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-gradient-to-br from-blue-50 to-purple-50'} border-2 border-blue-500 animate-fadeIn`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                      {evOwner.firstName?.charAt(0)}{evOwner.lastName?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-xl font-bold ${getColor('text.primary')} mb-1`}>
                        {evOwner.firstName} {evOwner.lastName}
                      </h4>
                      <p className={`text-sm ${getColor('text.secondary')}`}>{evOwner.email}</p>
                      <div className="mt-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                          Active Account
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>Phone</p>
                      <p className={`font-semibold ${getColor('text.primary')}`}>{evOwner.phoneNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>Vehicle</p>
                      <p className={`font-semibold ${getColor('text.primary')}`}>{evOwner.vehicleModel || 'N/A'}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>Battery Capacity</p>
                      <p className={`font-semibold ${getColor('text.primary')}`}>{evOwner.batteryCapacity || 'N/A'}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>Compatible Chargers</p>
                      <p className={`font-semibold ${getColor('text.primary')}`}>{evOwner.compatibleChargerTypes || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {!evOwner && !nicError && (
                <div className={`p-8 rounded-2xl ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'} text-center border-2 border-dashed ${getColor('border.primary')}`}>
                  <Search className={`w-16 h-16 mx-auto mb-4 ${getColor('text.tertiary')}`} />
                  <h4 className={`text-lg font-bold mb-2 ${getColor('text.primary')}`}>
                    Search for EV Owner
                  </h4>
                  <p className={`${getColor('text.secondary')}`}>
                    Enter the NIC number to find the EV owner profile and continue with booking
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Station */}
          {step === 2 && (
            <div className="animate-fadeIn space-y-4">
              <h3 className={`text-2xl font-bold mb-6 ${getColor('text.primary')}`}>
                Choose Your Charging Station
              </h3>
              {stations.map((station) => {
                const stationDetails = getStation(station.id);
                return (
                  <div
                    key={station.id}
                    onClick={() => setFormData({ ...formData, stationId: station.id })}
                    className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${formData.stationId === station.id
                      ? `border-blue-500 ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'} scale-105`
                      : `${darkMode ? 'border-slate-700 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300'}`
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`text-xl font-bold mb-2 ${getColor('text.primary')}`}>
                          {stationDetails?.stationName || station.name}
                        </h4>
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className={`w-4 h-4 ${getColor('text.secondary')}`} />
                          <span className={`text-sm ${getColor('text.secondary')}`}>
                            {stationDetails?.address || station.address}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className={`text-sm font-semibold ${getColor('text.primary')}`}>
                              {station.rating || '4.5'}
                            </span>
                          </div>
                          <div className={`px-3 py-1 rounded-full ${getColor('background.success')} ${getColor('text.success')} text-sm font-semibold`}>
                            {station.available || 'Available'} slots
                          </div>
                        </div>
                        {/* Show map for selected station */}
                        {formData.stationId === station.id && stationDetails?.latitude && stationDetails?.longitude && (
                          <div className="mt-4 rounded-xl overflow-hidden border-2 border-blue-500">
                            <iframe
                              width="100%"
                              height="200"
                              frameBorder="0"
                              style={{ border: 0 }}
                              src={`https://www.google.com/maps?q=${stationDetails.latitude},${stationDetails.longitude}&output=embed&z=15`}
                              allowFullScreen
                              title={`Map of ${stationDetails.stationName}`}
                            />
                          </div>
                        )}
                      </div>
                      <div className={`p-4 rounded-xl ${formData.stationId === station.id ? 'bg-blue-500' : darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <Zap className={`w-8 h-8 ${formData.stationId === station.id ? 'text-white' : darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Step 3: Select Date & Time */}
          {step === 3 && (
            <div className="animate-fadeIn">
              <h3 className={`text-2xl font-bold mb-6 ${getColor('text.primary')}`}>
                Pick Your Schedule
              </h3>

              <div className="space-y-6">
                {/* Enhanced Date Picker */}
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Reservation Date
                  </label>
                  <div className="relative">
                    <Calendar className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${getColor('text.tertiary')} pointer-events-none`} />
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full pl-12 pr-6 py-4 rounded-xl border-2 ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg cursor-pointer`}
                      style={{
                        colorScheme: darkMode ? 'dark' : 'light'
                      }}
                    />
                  </div>
                  {formData.date && (
                    <div className={`mt-2 p-3 rounded-lg ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'} flex items-center gap-2`}>
                      <Check className="w-4 h-4 text-blue-500" />
                      <span className={`text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                        {new Date(formData.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Time Selection with Validation */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Start Time
                    </label>
                    <div className="relative">
                      <Clock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${getColor('text.tertiary')} pointer-events-none`} />
                      <select
                        value={formData.startTime}
                        onChange={(e) => {
                          const newStartTime = e.target.value;
                          setFormData({
                            ...formData,
                            startTime: newStartTime,
                            // Reset end time if it's before or equal to new start time
                            endTime: formData.endTime && formData.endTime <= newStartTime ? '' : formData.endTime
                          });
                        }}
                        className={`w-full pl-12 pr-6 py-4 rounded-xl border-2 ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg appearance-none cursor-pointer`}
                      >
                        <option value="">Select time</option>
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>
                            {new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </option>
                        ))}
                      </select>
                      {/* <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${getColor('text.tertiary')} pointer-events-none`} /> */}
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      End Time
                    </label>
                    <div className="relative">
                      <Clock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${getColor('text.tertiary')} pointer-events-none`} />
                      <select
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        disabled={!formData.startTime}
                        className={`w-full pl-12 pr-6 py-4 rounded-xl border-2 ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <option value="">Select time</option>
                        {timeSlots
                          .filter(time => !formData.startTime || time > formData.startTime)
                          .map((time) => (
                            <option key={time} value={time}>
                              {new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </option>
                          ))}
                      </select>
                      {/* <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${getColor('text.tertiary')} pointer-events-none`} /> */}
                    </div>
                  </div>
                </div>

                {/* Duration Display */}
                {formData.startTime && formData.endTime && (
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-purple-500/10' : 'bg-purple-50'} border-2 border-purple-500/20`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-500" />
                        <span className={`font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                          Charging Duration
                        </span>
                      </div>
                      <span className={`text-lg font-bold ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                        {(() => {
                          const start = new Date(`2000-01-01T${formData.startTime}`);
                          const end = new Date(`2000-01-01T${formData.endTime}`);
                          const diffMs = end - start;
                          const diffHrs = Math.floor(diffMs / 3600000);
                          const diffMins = Math.floor((diffMs % 3600000) / 60000);
                          return `${diffHrs}h ${diffMins}m`;
                        })()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Charger Type Selection */}
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Charger Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, chargerType: 'AC' })}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 ${formData.chargerType === 'AC'
                        ? 'border-emerald-500 bg-emerald-500/10 scale-105 shadow-lg shadow-emerald-500/20'
                        : darkMode ? 'border-slate-700 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <Battery className={`w-12 h-12 mx-auto mb-3 transition-transform ${formData.chargerType === 'AC' ? 'text-emerald-500 scale-110' : darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                      <p className={`text-lg font-bold mb-1 ${getColor('text.primary')}`}>AC Charging</p>
                      <p className={`text-sm ${getColor('text.secondary')}`}>Standard • 7-22 kW</p>
                      <p className={`text-xs mt-2 ${getColor('text.tertiary')}`}>Perfect for overnight</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, chargerType: 'DC' })}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 ${formData.chargerType === 'DC'
                        ? 'border-orange-500 bg-orange-500/10 scale-105 shadow-lg shadow-orange-500/20'
                        : darkMode ? 'border-slate-700 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <Zap className={`w-12 h-12 mx-auto mb-3 transition-transform ${formData.chargerType === 'DC' ? 'text-orange-500 scale-110' : darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                      <p className={`text-lg font-bold mb-1 ${getColor('text.primary')}`}>DC</p>
                      <p className={`text-sm ${getColor('text.secondary')}`}>Rapid • 50-350 kW</p>
                      <p className={`text-xs mt-2 ${getColor('text.tertiary')}`}>Quick charge in minutes</p>
                    </button>
                  </div>
                </div>

                {/* Info Alert */}
                <div className={`p-4 rounded-xl ${getColor('background.info')} border ${getColor('border.info')}`}>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className={`text-sm ${getColor('text.info')}`}>
                      <p className="font-semibold mb-1">Booking Tips</p>
                      <ul className="space-y-1">
                        <li>• End time must be after start time</li>
                        <li>• Minimum booking duration: 1 hour</li>
                        <li>• Available slots: 8:00 AM - 8:00 PM</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Select Slot */}
          {step === 4 && (
            <div className="animate-fadeIn">
              <h3 className={`text-2xl font-bold mb-6 ${getColor('text.primary')}`}>
                Choose Your Slot
              </h3>

              {loading ? (
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className={`p-6 rounded-2xl border-2 ${getColor('border.primary')} animate-pulse`}>
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                      <div className={`h-4 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded mb-2`}></div>
                      <div className={`h-3 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
                    </div>
                  ))}
                </div>
              ) : availableSlots.length === 0 ? (
                <div className={`p-8 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'} text-center`}>
                  <X className={`w-16 h-16 mx-auto mb-4 ${getColor('text.tertiary')}`} />
                  <h4 className={`text-xl font-bold mb-2 ${getColor('text.primary')}`}>
                    No Available Slots
                  </h4>
                  <p className={`${getColor('text.secondary')}`}>
                    All slots are booked for the selected time. Please try a different time slot.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {availableSlots.map((slot) => {
                    const isSelected = formData.slotId === slot.id;
                    const isOperational = slot.isOperational;

                    return (
                      <button
                        key={slot.id}
                        disabled={!isOperational}
                        onClick={() => isOperational && setFormData({ ...formData, slotId: slot.id })}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 ${isSelected
                          ? 'border-blue-500 bg-blue-500/10 scale-105'
                          : isOperational
                            ? darkMode ? 'border-slate-700 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300'
                            : darkMode ? 'border-slate-800 bg-slate-800/50 opacity-50' : 'border-slate-100 bg-slate-100 opacity-50'
                          } ${!isOperational && 'cursor-not-allowed'}`}
                      >
                        <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center ${isSelected
                          ? 'bg-blue-500'
                          : isOperational
                            ? darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
                            : darkMode ? 'bg-slate-700' : 'bg-slate-200'
                          }`}>
                          {isOperational ? (
                            slot.chargerType === 'DC' ? (
                              <Zap className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-orange-500'}`} />
                            ) : (
                              <Battery className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                            )
                          ) : (
                            <X className={`w-8 h-8 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                          )}
                        </div>
                        <p className={`font-bold text-lg ${getColor('text.primary')}`}>
                          {slot.slotNumber}
                        </p>
                        <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>
                          {slot.chargerType} • {slot.powerOutput}kW
                        </p>
                        <p className={`text-sm mt-1 ${isOperational
                          ? 'text-emerald-500 font-semibold'
                          : darkMode ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                          {isOperational ? 'Available' : 'Unavailable'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className={`p-4 rounded-xl ${getColor('background.info')} ${getColor('border.info')}`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className={`text-sm ${getColor('text.info')}`}>
                    {formData.slotId
                      ? `Your selected slot will be reserved for ${formData.startTime} - ${formData.endTime}`
                      : `Showing ${availableSlots.length} available slot${availableSlots.length !== 1 ? 's' : ''} for your selected time`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review & Confirm */}
          {step === 5 && (
            <div className="animate-fadeIn">
              <h3 className={`text-2xl font-bold mb-6 ${getColor('text.primary')}`}>
                Review Your Booking
              </h3>

              {/* EV Owner Details Section - ADD THIS */}
              <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-blue-900/20 to-purple-900/20' : 'bg-gradient-to-br from-blue-50 to-purple-50'} border-2 border-blue-500/30 mb-6`}>
                <h4 className={`text-lg font-bold mb-4 ${getColor('text.primary')} flex items-center gap-2`}>
                  <User className="w-5 h-5 text-blue-500" />
                  EV Owner Details
                </h4>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    {evOwner.firstName?.charAt(0)}{evOwner.lastName?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h5 className={`text-xl font-bold ${getColor('text.primary')} mb-1`}>
                      {evOwner.firstName} {evOwner.lastName}
                    </h5>
                    <p className={`text-sm ${getColor('text.secondary')} mb-2`}>{evOwner.email}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        Active Account
                      </span>
                      <span className={`px-3 py-1 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'} text-xs font-semibold ${getColor('text.primary')}`}>
                        {evOwner.gender}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-white'}`}>
                    <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>NIC Number</p>
                    <p className={`font-semibold ${getColor('text.primary')}`}>{evOwner.nic}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-white'}`}>
                    <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>Phone</p>
                    <p className={`font-semibold ${getColor('text.primary')}`}>{evOwner.phoneNumber}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-white'}`}>
                    <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>Vehicle Model</p>
                    <p className={`font-semibold ${getColor('text.primary')}`}>{evOwner.vehicleModel}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-white'}`}>
                    <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>Plate Number</p>
                    <p className={`font-semibold ${getColor('text.primary')}`}>{evOwner.vehiclePlateNumber}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-white'}`}>
                    <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>Battery Capacity</p>
                    <p className={`font-semibold ${getColor('text.primary')}`}>{evOwner.batteryCapacity}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-white'}`}>
                    <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>Compatible Chargers</p>
                    <p className={`font-semibold ${getColor('text.primary')}`}>{evOwner.compatibleChargerTypes}</p>
                  </div>
                </div>
              </div>

              {/* Booking Details Section */}
              <div className={`p-6 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-gradient-to-br from-slate-50 to-slate-100'} space-y-4 mb-6`}>
                <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                  <span className={`font-medium ${getColor('text.secondary')}`}>Station</span>
                  <span className={`font-bold text-lg ${getColor('text.primary')}`}>
                    {getStation(formData.stationId)?.stationName || stations.find(s => s.id === formData.stationId)?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                  <span className={`font-medium ${getColor('text.secondary')}`}>Address</span>
                  <span className={`font-bold text-lg ${getColor('text.primary')}`}>
                    {getStation(formData.stationId)?.address || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                  <span className={`font-medium ${getColor('text.secondary')}`}>Date</span>
                  <span className={`font-bold text-lg ${getColor('text.primary')}`}>
                    {formData.date && new Date(formData.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                {/* Rest of the review fields remain the same */}
                <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                  <span className={`font-medium ${getColor('text.secondary')}`}>Time</span>
                  <span className={`font-bold text-lg ${getColor('text.primary')}`}>
                    {formData.startTime} - {formData.endTime}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                  <span className={`font-medium ${getColor('text.secondary')}`}>Charger Type</span>
                  <span className={`font-bold text-lg flex items-center gap-2 ${getColor('text.primary')}`}>
                    {formData.chargerType === 'AC' ? (
                      <Battery className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Zap className="w-5 h-5 text-orange-500" />
                    )}
                    {formData.chargerType}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className={`font-medium ${getColor('text.secondary')}`}>Slot</span>
                  <span className={`font-bold text-lg ${getColor('text.primary')}`}>
                    {formData.slotId}
                  </span>
                </div>
              </div>

              {/* Show map in review */}
              {getStation(formData.stationId)?.latitude && getStation(formData.stationId)?.longitude && (
                <div className="mb-6 rounded-2xl overflow-hidden border-2 border-blue-500">
                  <iframe
                    width="100%"
                    height="250"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps?q=${getStation(formData.stationId).latitude},${getStation(formData.stationId).longitude}&output=embed&z=15`}
                    allowFullScreen
                    title={`Map of ${getStation(formData.stationId).stationName}`}
                  />
                </div>
              )}

              <div className={`p-4 rounded-xl ${getColor('background.warning')} ${getColor('border.warning')}`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className={`text-sm ${getColor('text.warning')}`}>
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
        <div className={`border-t ${getColor('border.primary')} p-6`}>
          <div className="flex gap-3 ">
            {step > 1 && (
              <button
                onClick={prevStep}
                className={`px-8 py-3 rounded-xl border-2 ${darkMode ? 'border-slate-700 text-white hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-50'} font-semibold transition-all`}
              >
                Previous
              </button>
            )}
            {step < 5 ? (
              <button
                onClick={nextStep}
                disabled={
                  (step === 1 && !evOwner) ||
                  (step === 2 && !formData.stationId) ||
                  (step === 3 && (!formData.date || !formData.startTime || !formData.endTime)) ||
                  (step === 4 && !formData.slotId) ||
                  loading
                }
                className="flex-1 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold hover:shadow-xl hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                {loading && step === 2 ? 'Checking Availability...' : 'Continue'}
              </button>
            ) : (
              <button
                onClick={handleCreateBooking}
                disabled={loading}
                className="flex-1 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold hover:shadow-xl hover:shadow-emerald-500/50 transition-all disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Confirm Booking'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingManagement;