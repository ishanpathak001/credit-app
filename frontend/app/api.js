
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://192.168.1.9:5000/api/users'
});

export default API;
