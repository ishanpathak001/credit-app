
import axios from 'axios';

const API = axios.create({
  baseURL: "http://10.154.100.137:5000/api",
});

export default API;