import axios from 'axios';
import { auth } from '../context/AuthContext';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// =========================================================
// ADD FIREBASE TOKEN TO EVERY REQUEST
// =========================================================

API.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;

    if (user) {
      try {
        const token =
          await user.getIdToken();

        config.headers.Authorization =
          `Bearer ${token}`;
      } catch (error) {
        console.error(
          'Error getting Firebase token:',
          error
        );
      }
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

export default API;