import axios from 'axios';
import { getAuth } from 'firebase/auth';

// Create a custom debug function that can be toggled
const debug = process.env.NODE_ENV === 'development' ? 
  (...args) => console.log('[API]', ...args) : 
  () => {};

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5002/api',
  withCredentials: true,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  async (config) => {
    debug(`[${config.method?.toUpperCase()}]`, config.url);
    
    try {
      const auth = getAuth();
      if (auth.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken(true);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            debug('Added auth token to request');
          }
        } catch (tokenError) {
          debug('Error getting auth token:', tokenError);
          // Don't block the request if token refresh fails
        }
      } else {
        debug('No current user, making unauthenticated request');
      }
      
      return config;
    } catch (error) {
      debug('Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    debug('Request interceptor error (handler):', error);
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    debug(`[${response.status}] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    const errorContext = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      requestData: error.config?.data,
      headers: error.config?.headers
    };

    if (error.response) {
      // Server responded with error status
      debug('API Error Response:', errorContext);
      
      // Handle specific status codes
      if (error.response.status === 401) {
        // Handle unauthorized (token expired, etc.)
        debug('Authentication error - redirecting to login');
        // You might want to redirect to login or refresh token here
      } else if (error.response.status === 403) {
        debug('Forbidden - insufficient permissions');
      } else if (error.response.status === 404) {
        debug('Resource not found');
      } else if (error.response.status >= 500) {
        debug('Server error occurred');
      }
      
    } else if (error.request) {
      // Request was made but no response received
      debug('No response received:', {
        ...errorContext,
        message: 'No response from server',
        code: error.code
      });
    } else {
      // Request setup error
      debug('Request setup error:', {
        ...errorContext,
        message: error.message,
        stack: error.stack
      });
    }

    // Add additional context to the error
    const enhancedError = new Error(error.message || 'API request failed');
    enhancedError.isAxiosError = true;
    enhancedError.config = error.config;
    enhancedError.response = error.response;
    enhancedError.request = error.request;
    enhancedError.status = error.response?.status;
    enhancedError.statusText = error.response?.statusText;
    enhancedError.data = error.response?.data;
    
    return Promise.reject(enhancedError);
  }
);

// Helper function to handle API errors consistently
export const handleApiError = (error, customMessage = 'An error occurred') => {
  console.error(`${customMessage}:`, error);
  
  let message = customMessage;
  let details = null;
  
  if (error.response) {
    // Server responded with error status
    details = error.response.data?.error || error.response.data?.message;
    message = details || `${error.response.status} ${error.response.statusText}`;
  } else if (error.request) {
    // Request was made but no response received
    message = 'No response from server. Please check your connection.';
  } else {
    // Request setup error
    details = error.message;
  }
  
  return { error: true, message, details };
};

export default api;
