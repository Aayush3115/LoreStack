import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/",
});

// Add a request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    // Ensure token is present and not just a string "null"/"undefined"
    if (token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration/invalidity
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If we get a 401, the token is likely invalid or expired
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      // Optional: redirect to login if not on a public page
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export default API;

