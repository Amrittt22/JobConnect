import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { supabase } from "../services/supabase";
import { getMe } from "../services/authServices";
import { connectSocket, disconnectSocket } from "../socket";

import {
  setSession,
  setUser,
  setLoading,
  logout,
} from "../store/authSlice";

function AuthInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (!session) {
          disconnectSocket();
          dispatch(logout());
          dispatch(setLoading(false));
          return;
        }

        dispatch(setSession(session));
        connectSocket(session.access_token);

        const data = await getMe(session.access_token);

        if (!mounted) return;

        dispatch(setUser(data.user));
      } catch (error) {
        console.error("Auth initialization failed:", error);

        if (mounted) {
          dispatch(logout());
        }
      } finally {
        if (mounted) {
          dispatch(setLoading(false));
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      if (!session) {
        disconnectSocket();
        dispatch(logout());
        dispatch(setLoading(false));
        return;
      }

      dispatch(setSession(session));
      connectSocket(session.access_token);

      try {
        const data = await getMe(session.access_token);

        if (mounted) {
          dispatch(setUser(data.user));
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      disconnectSocket();
    };
  }, [dispatch]);

  return children;
}

export default AuthInitializer;