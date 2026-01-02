import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = axios.create({
  baseURL: "http://192.168.1.3:5000/api",
});

// Interceptor to attach JWT token
API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token'); // or wherever you store it
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
