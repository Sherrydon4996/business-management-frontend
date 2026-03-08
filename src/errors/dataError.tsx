import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
}

export function ErrorState({
  error,
  onRetry,
  showHomeButton = false,
}: ErrorStateProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 shadow-card max-w-md">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Failed to Load Tenants
              </h3>
              <p className="text-sm text-muted-foreground">
                {error || "An unexpected error occurred. Please try again."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
              {onRetry && (
                <Button onClick={onRetry} className="flex-1" variant="default">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              )}

              {showHomeButton && (
                <Button
                  onClick={() => navigate("/")}
                  className="flex-1"
                  variant="outline"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              If this problem persists, please contact support.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Alternative compact error banner
export function ErrorBanner({
  error,
  onRetry,
  onDismiss,
}: ErrorStateProps & { onDismiss?: () => void }) {
  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-foreground">
            Error Loading Data
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            {error || "Something went wrong while fetching tenants."}
          </p>
        </div>
        <div className="flex gap-2">
          {onRetry && (
            <Button onClick={onRetry} size="sm" variant="outline">
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button onClick={onDismiss} size="sm" variant="ghost">
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
