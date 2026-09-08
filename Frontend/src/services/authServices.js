import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const loginUser = async (credentials) => {
  const response = await axios.post(
    `${API_URL}/api/auth/login`,
    credentials
  );

  return response.data;
};

export const registerUser = async (userData) => {
  const response = await axios.post(
    `${API_URL}/api/auth/register`,
    userData
  );

  return response.data;
};

export const getMe = async (token) => {
  const response = await axios.get(
    `${API_URL}/api/auth/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const logoutUser = async (token) => {
  const response = await axios.post(
    `${API_URL}/api/auth/logout`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};