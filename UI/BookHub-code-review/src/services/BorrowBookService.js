import axios from 'axios';
import { API_KEY } from '../utils/config';
import { store } from '../store.js';

// Helper function to get the current access token from Redux store
const getAccessToken = () => {
  const state = store.getState();
  return state.user.accessToken;
};

// Helper function to create axios instance with auth header
const createAuthorizedAxios = () => {
  const token = getAccessToken();
  return axios.create({
    baseURL: API_KEY,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const fetchBooks = async () => {
  try {
    const axiosInstance = createAuthorizedAxios();
    const response = await axiosInstance.get('/books');
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch books");
  }
};

export const borrowBook = async (book_name) => {
  try {
    const axiosInstance = createAuthorizedAxios();
    const response = await axiosInstance.put('/borrow', { book_name });
    if (response.data.statusCode === 200) {
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to borrow book");
  }
};

export const returnBook = async (book_name) => {
  try {
    const axiosInstance = createAuthorizedAxios();
    const response = await axiosInstance.put('/return', { book_name });
    if (response.data.statusCode === 200) {
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to return book");
  }
};
