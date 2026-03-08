import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  message = "Loading...",
  fullScreen = true,
}: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Outer ring */}
        <div className="h-16 w-16 rounded-full border-4 border-gray-200"></div>
        {/* Spinning ring */}
        <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-primary"></div>
      </div>
      <p className="text-lg font-medium text-gray-700">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        {content}
      </div>
    );
  }

  return content;
}

// Alternative spinner styles
export function AuthLoadingSpinner({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="rounded-2xl bg-white p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-20 w-20">
            {/* Pulse effect */}
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20"></div>
            {/* Main spinner */}
            <div className="relative flex h-full w-full items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-900">{message}</p>
            <p className="mt-1 text-sm text-gray-500">Please wait...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Logout spinner (simpler, faster)
export function LogoutSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-medium text-gray-700">Logging out...</p>
      </div>
    </div>
  );
}
