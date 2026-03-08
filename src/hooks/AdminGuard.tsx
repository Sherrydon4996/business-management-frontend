import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from "@/store/hooks"; // or wherever you get user from

export function useAdminCheck() {
  const { toast } = useToast();
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const checkAdminOrToast = (): boolean => {
    if (!isAdmin) {
      toast({
        title: "Permission Denied",
        description: "Only admins are allowed to make changes in the system.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  return { isAdmin, checkAdminOrToast };
}
