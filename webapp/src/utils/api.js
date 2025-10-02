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

};

export default api;
