
import axios from 'axios';
import { GestureResponderEvent } from 'react-native';

const API = axios.create({
  baseURL: 'http://192.168.1.9:5000/api/users'
});


export default API;
