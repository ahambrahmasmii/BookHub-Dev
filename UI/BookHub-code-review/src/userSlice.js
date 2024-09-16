import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: '',
  email: '',
  userType: '',
  idToken: '',
  accessToken: '', // Initialize accessToken
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.userType = action.payload.userType;
      state.idToken = action.payload.idToken;
      state.accessToken = action.payload.accessToken; // Set accessToken
    },
    // Other reducers...
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;