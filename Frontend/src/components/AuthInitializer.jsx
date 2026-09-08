import { useEffect } from "react";
import { useDispatch } from "react-redux";

import {
  setSession,
  setUser,
  setLoading,
  logout,
} from "../store/authSlice";

import { getMe } from "../services/authServices";

function AuthInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedSession = localStorage.getItem(
          "jobconnect_session"
        );

        if (!savedSession) {
          dispatch(setLoading(false));
          return;
        }

        const session = JSON.parse(savedSession);

        if (!session?.access_token) {
          dispatch(logout());
          return;
        }

        dispatch(setSession(session));

        const data = await getMe(session.access_token);

        dispatch(setUser(data.user));
      } catch (error) {
        console.error("Session restore failed:", error);

        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
      }
    };

    initializeAuth();
  }, [dispatch]);

  return children;
}

export default AuthInitializer;