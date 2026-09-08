import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  session: null,
  user: null,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    setSession: (state, action) => {
      state.session = action.payload;

      if (action.payload) {
        localStorage.setItem(
          "jobconnect_session",
          JSON.stringify(action.payload)
        );
      }
    },

    setUser: (state, action) => {
      state.user = action.payload;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    logout: (state) => {
      state.session = null;
      state.user = null;

      localStorage.removeItem("jobconnect_session");
    },
  },
});

export const {
  setSession,
  setUser,
  setLoading,
  logout,
} = authSlice.actions;

export default authSlice.reducer;