const API_BASE_URL = '/api';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Important for sending/receiving session cookies
  });

  if (response.status === 401 || response.status === 403) {
    // Auto logout on unauthorized
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentRole');
    
    // Only redirect if we're not already on the login page to avoid loops
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  return response;
};
