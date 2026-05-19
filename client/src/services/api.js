import axios from 'axios';

/**
 * Axios instance configured for our API.
 * 
 * WHY use an instance instead of global axios?
 * - We can set a base URL so we don't have to type it everywhere.
 * - We can add interceptors to automatically attach JWT tokens to every request.
 */
const api = axios.create({
  baseURL: '/api', // Proxied to http://localhost:5000 in Vite config
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle global errors (like token expiry)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If the server returns 401 Unauthorized, the token is invalid/expired
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login (handled better in components, but this is a fallback)
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
