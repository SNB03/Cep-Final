// // src/api/config.js
// import axios from 'axios';

// // Make sure your backend is running on this port
// 

// const api = axios.create({
//   baseURL: API_BASE_URL,
// });

// export default api;
import axios from 'axios';
export const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Make sure this matches your backend URL
  timeout: 10000, // <--- Add this: 10 seconds timeout (adjust as needed)
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;