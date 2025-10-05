const API_URL = 'http://localhost:5116/api';

// Helper function for making API requests
const fetchApi = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    // console.log('API Request:', { endpoint, options });
    // console.log('API Response:', response);

    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return null;
    }


    // Check if the response has content before trying to parse JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      // Only try to parse JSON if there's content and it's JSON type
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};


      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }


      return data;
    } else {
      // Handle non-JSON responses
      if (!response.ok) {
        throw new Error('Something went wrong');
      }


      return { success: true };
    }
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// API methods
export const api = {
  // Auth
  login: (credentials) =>
    fetchApi('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  register: (userData) =>
    fetchApi('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  logout: () =>
    fetchApi('/auth/logout', {
      method: 'POST'
    }),

  //Station
  addStation: (station) =>
    fetchApi('/Station', {
      method: 'POST',
      body: JSON.stringify(station)
    }),
  addStationSlot: (slot) =>
    fetchApi('/Slot', {
      method: 'POST',
      body: JSON.stringify(slot)
    }),
  addStationSchedule: (schedule) =>
    fetchApi('/Schedule', {
      method: 'POST',
      body: JSON.stringify(schedule)
    }),
  getAllStation: () =>
    fetchApi('/Station', {
      method: 'GET'
    }),
  getStationAllDetails: (id) =>
    fetchApi(`/Station/all/${id}`, {
      method: 'GET'
    }),
  updateSlotOperationalStatus: (slotId, newStatus) =>
    fetchApi(`/Slot/${slotId}/operational-status`, {
      method: 'PATCH',
      body: JSON.stringify(newStatus)
    }),
  updateSchedule: (slotId, newSchedule) =>
    fetchApi(`/StationSchedule/${slotId}`, {
      method: 'PUT',
      body: JSON.stringify(newSchedule)
    }),
  updateStationDetails: (stationId, updatedStation) =>
    fetchApi(`/Station/${stationId}`, {
      method: 'PUT',
      body: JSON.stringify(updatedStation)
    }),
  updateStationStatus: (stationId, status) =>
    fetchApi(`/Station/${stationId}/active-status`, {
      method: 'PATCH',
      body: JSON.stringify(status)
    }),
  getAllSlotTypes: () =>
    fetchApi('/SlotType', { method: 'GET' }),
  addSlotType: (slotType) =>
    fetchApi('/SlotType', { method: 'POST', body: JSON.stringify(slotType) }),
  updateSlotType: (id, slotType) =>
    fetchApi(`/SlotType/${id}`, { method: 'PUT', body: JSON.stringify(slotType) }),
  deleteSlotType: (id) =>
    fetchApi(`/SlotType/${id}`, { method: 'DELETE' }),

  // Booking
  getAllBookings: () =>
    fetchApi('/Booking', {
      method: 'GET'
    }),

  getBookingById: (id) =>
    fetchApi(`/Booking/${id}`, {
      method: 'GET'
    }),

  getBookingsByStation: (stationId) =>
    fetchApi(`/Booking/station/${stationId}`, {
      method: 'GET'
    }),

  getBookingsBySlot: (slotId) =>
    fetchApi(`/Booking/slot/${slotId}`, {
      method: 'GET'
    }),

  getBookingsByStatus: (status) =>
    fetchApi(`/Booking/status/${status}`, {
      method: 'GET'
    }),

  getBookingsByDateRange: (startDate, endDate) =>
    fetchApi(`/Booking/date-range?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET'
    }),

  checkAvailability: (stationId, reservationDate, startTime, endTime, chargerType) =>
    fetchApi(`/Booking/availability?stationId=${stationId}&reservationDate=${reservationDate}&startTime=${startTime}&endTime=${endTime}&chargerType=${chargerType}`, {
      method: 'GET'
    }),

  createBooking: (bookingData) =>
    fetchApi('/Booking/create', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    }),

  updateBooking: (id, bookingData) =>
    fetchApi(`/Booking/${id}/update`, {
      method: 'PUT',
      body: JSON.stringify(bookingData)
    }),

  cancelBooking: (id, cancelData) =>
    fetchApi(`/Booking/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify(cancelData)
    }),

  updateBookingStatus: (id, status) =>
    fetchApi(`/Booking/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  scanQRCode: (id) =>
    fetchApi(`/Booking/${id}/scan-qr`, {
      method: 'POST'
    }),

  updateEnergyAndCost: (id, energyConsumed, cost) =>
    fetchApi(`/Booking/${id}/energy-cost`, {
      method: 'PATCH',
      body: JSON.stringify({ energyConsumed, cost })
    }),

  deleteBooking: (id) =>
    fetchApi(`/Booking/${id}`, {
      method: 'DELETE'
    }),

  getChargingRate: (id) =>
    fetchApi(`/Booking/${id}/charging-rate`, {
      method: 'GET'
    }),

  // EV Owner Management
  getAllEVOwners: () =>
    fetchApi('/EVOwner', {
      method: 'GET'
    }),

  getEVOwnerByNIC: (nic) =>
    fetchApi(`/EVOwner/${nic}`, {
      method: 'GET'
    }),

  createEVOwner: (ownerData) =>
    fetchApi('/EVOwner', {
      method: 'POST',
      body: JSON.stringify(ownerData)
    }),

  updateEVOwner: (nic, ownerData) =>
    fetchApi(`/EVOwner/${nic}`, {
      method: 'PUT',
      body: JSON.stringify(ownerData)
    }),

  deleteEVOwner: (nic) =>
    fetchApi(`/EVOwner/${nic}`, {
      method: 'DELETE'
    }),

  activateEVOwner: (nic) =>
    fetchApi(`/EVOwner/${nic}/activate`, {
      method: 'PATCH'
    }),

  deactivateEVOwner: (nic) =>
    fetchApi(`/EVOwner/${nic}/deactivate`, {
      method: 'PATCH'
    }),

  getActiveEVOwners: () =>
    fetchApi('/EVOwner/active', {
      method: 'GET'
    }),

  getInactiveEVOwners: () =>
    fetchApi('/EVOwner/inactive', {
      method: 'GET'
    }),

  searchEVOwners: (searchTerm) =>
    fetchApi(`/EVOwner/search?searchTerm=${encodeURIComponent(searchTerm)}`, {
      method: 'GET'
    }),

  // getEVOwnerStats: () =>
  //   fetchApi('/EVOwner/stats', {
  //     method: 'GET'
  //   }),

};

export default api;
