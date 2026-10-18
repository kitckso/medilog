import { cva } from "class-variance-authority";

/**
 * Variant style map for Badge. Split from the component so the fast-refresh
 * rule sees one component export per file (same pattern as button-variants).
 */
export const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>span]:leading-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-white",
        outline: "text-foreground",
        success: "border-transparent bg-success/15 text-success",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
