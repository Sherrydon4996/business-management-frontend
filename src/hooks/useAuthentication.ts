import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutAction, setCredentials, setLoading } from "@/slices/authSlice";
import { api } from "@/Apis/axiosApi";
import type { RootState } from "@/store/store";
import { toast } from "@/hooks/use-toast";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, accessToken } = useAppSelector(
    (state: RootState) => state.auth,
  );

  const bootstrapAuth = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const res = await api.post("/api/v1/auth/refresh");
      const { accessToken, user } = res.data;

      if (!user) {
        dispatch(logoutAction());
        return;
      }

      dispatch(setCredentials({ accessToken, user }));
    } catch (error) {
      dispatch(logoutAction());
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const login = async (username: string, password: string) => {
    try {
      const res = await api.post("/api/v1/auth/login", {
        username,
        password,
      });

      const { accessToken, user } = res.data;

      // ✅ Only dispatch success if we have valid data
      if (accessToken && user) {
        dispatch(setCredentials({ accessToken, user }));
        return { success: true };
      } else {
        return {
          success: false,
          error: "Invalid response from server",
        };
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Invalid username or password";

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const logout = async () => {
    try {
      // ✅ Set flag to indicate intentional logout
      (api as any)._isIntentionalLogout = true;

      await api.post("/api/v1/auth/logout");

      // ✅ Clear auth state
      dispatch(logoutAction());

      // ✅ Show success toast
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
        variant: "success",
      });
    } catch (error) {
      console.error("Logout error:", error);

      // ✅ Even if API call fails, clear local state
      dispatch(logoutAction());

      toast({
        title: "Logged out",
        description: "You have been logged out",
        variant: "success",
      });
    } finally {
      // ✅ Clear the flag after a short delay
      setTimeout(() => {
        delete (api as any)._isIntentionalLogout;
      }, 100);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    accessToken,
    login,
    logout,
    bootstrapAuth,
  };
};
