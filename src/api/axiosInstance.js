// frontend/src/api/axiosInstance.js
import axios from 'axios';

const instance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,  // ex: http://localhost:5000/api
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour injecter le token JWT dans chaque requête
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('certus_token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  error => Promise.reject(error)
);

export default instance;
