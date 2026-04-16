import axios from "axios";

// Register new User
export const registerUser = async (data: {
  username: string;
  email: string;
  password: string;
  password2: string;
}) => {
  const response = await axios.post(`/api/users/register/`, data);
  return response.data;
};

// Login User
export const loginUser = async (data: { username: string; password: string }) => {
  const response = await axios.post(`/api/users/token/`, data);
  return response.data;
};

