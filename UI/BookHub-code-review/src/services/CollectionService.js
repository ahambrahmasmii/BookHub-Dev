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

export const fetchCollections = () => {
  const axiosInstance = createAuthorizedAxios();
  return axiosInstance.get('/collections_list', {
    headers: { "Cache-Control": "no-cache" },
  });
};


export const fetchResources = (collectionName) => {
  const axiosInstance = createAuthorizedAxios();
  return axiosInstance.get(`/collections_list/${collectionName}/resources`, {
    headers: { "Cache-Control": "no-cache" },
  });
};

