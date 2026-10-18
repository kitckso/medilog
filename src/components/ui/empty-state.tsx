import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  /** Muted one-liner below the title. */
  description?: string;
  /** Optional call to action rendered under the description. */
  action?: React.ReactNode;
  className?: string;
}

/**
 * Shared empty state: an icon tile, a short title, and at most one action so
 * every tab ends a list the same calm way.
 */
function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-12 text-center", className)}>
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export { EmptyState };
export type { EmptyStateProps };
