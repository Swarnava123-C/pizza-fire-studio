import { Loader2, Inbox, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardLoading = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4 animate-in fade-in duration-300">
    <Skeleton className="h-10 w-64" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={`row-${i}`} className="h-20 rounded-xl" />
    ))}
  </div>
);

export const DashboardEmpty = ({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  description = "Data will appear here once available.",
}: {
  icon?: typeof Inbox;
  title?: string;
  description?: string;
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
    <div className="p-4 rounded-full bg-muted/50 mb-4">
      <Icon className="w-8 h-8 text-muted-foreground" />
    </div>
    <h3 className="font-display text-xl text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
  </div>
);

export const DashboardError = ({
  message = "Something went wrong",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
    <div className="p-4 rounded-full bg-destructive/10 mb-4">
      <AlertCircle className="w-8 h-8 text-destructive" />
    </div>
    <h3 className="font-display text-xl text-foreground mb-1">Error</h3>
    <p className="text-sm text-muted-foreground mb-4 max-w-sm">{message}</p>
    {onRetry && (
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="w-4 h-4 mr-1" /> Retry
      </Button>
    )}
  </div>
);
