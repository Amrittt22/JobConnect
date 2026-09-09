import axios from "axios";
import { supabase } from "./supabase";

const API_URL = import.meta.env.VITE_API_URL;

export const registerUser = async (userData) => {
  const response = await axios.post(
    `${API_URL}/api/auth/register`,
    userData
  );

  return response.data;
};

export const loginUser = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
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