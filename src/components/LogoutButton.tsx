import { useState } from "react";
import { useAuth } from "@/hooks/useAuthentication";
import { LogoutSpinner } from "@/loaders/authSpinner";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();

      toast({
        title: "Logged out successfully",
        description: "See you next time!",
        variant: "success",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    } finally {
      // Keep the spinner for a brief moment for smooth transition
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 300);
    }
  };

  return (
    <>
      {isLoggingOut && <LogoutSpinner />}

      <Button
        variant="ghost"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="w-full justify-start"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Log Out
      </Button>
    </>
  );
}

// Alternative: Dropdown menu item version
export function LogoutMenuItem() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();

      toast({
        title: "Logged out successfully",
        description: "See you next time!",
        variant: "success",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
      setIsLoggingOut(false);
    }
  };

  if (isLoggingOut) {
    return <LogoutSpinner />;
  }

  return (
    <button
      onClick={handleLogout}
      className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Log out</span>
    </button>
  );
}
