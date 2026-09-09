import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { supabase } from "../services/supabase";
import { getMe } from "../services/authServices";

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
          dispatch(logout());
          dispatch(setLoading(false));
          return;
        }

        dispatch(setSession(session));

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
        dispatch(logout());
        dispatch(setLoading(false));
        return;
      }

      dispatch(setSession(session));

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
    };
  }, [dispatch]);

  return children;
}

export default AuthInitializer;