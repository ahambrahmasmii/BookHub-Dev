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

export const createCollection = async (collectionName) => {
  const axiosInstance = createAuthorizedAxios();
  try {
    const response = await axiosInstance.post('/add_collection', {
      collection_name: collectionName
    }, {
      headers: { "Content-Type": "application/json" }
    });
    console.log("Create collection response:", response);
    return response;
  } catch (error) {
    console.error("Error creating collection:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
    }
    throw error;
  }
};
  
