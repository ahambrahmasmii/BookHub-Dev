import { API_KEY, cognito_client_id, cognito_user_pool_id } from '../utils/config';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import axios from 'axios';
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

export const poolData = {
    UserPoolId: cognito_user_pool_id,
    ClientId: cognito_client_id,
};

export const userPool = new CognitoUserPool(poolData);

export const login = (email_id, password) => {
    return axios.post(
        `${API_KEY}/login`,
        { email_id, password },
        { headers: { 'Content-Type': 'application/json' } }
    );
};

export const resetPassword = (email_id, new_password) => {
    return axios.post(
        `${API_KEY}/reset-password`,
        { email_id, new_password },
        { headers: { 'Content-Type': 'application/json' } }
    );
};

export const signup = (name, email_id, password, role) => {
    return axios.post(
        `${API_KEY}/signup`,
        { name, email_id, password, role },
        { headers: { 'Content-Type': 'application/json' } }
    );
};

