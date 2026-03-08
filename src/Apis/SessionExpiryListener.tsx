// src/components/SessionExpiryListener.tsx
import { useEffect, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/Apis/axiosApi";

export function SessionExpiryListener() {
  const { toast } = useToast();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const wasAuthenticatedRef = useRef(isAuthenticated);

  useEffect(() => {
    // ✅ Check if this was an intentional logout
    const isIntentionalLogout = (api as any)._isIntentionalLogout;

    // If user WAS authenticated but now is NOT, they were logged out
    if (wasAuthenticatedRef.current && !isAuthenticated) {
      // ✅ Only show "Session Expired" if it's NOT an intentional logout
      if (!isIntentionalLogout) {
        toast({
          variant: "destructive",
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          duration: 5000,
        });
      }
    }

    wasAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, toast]);

  return null; // This component doesn't render anything
}
