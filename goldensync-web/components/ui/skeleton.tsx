// WHAT: Simple pulsing placeholder block from the UI kit.
// KEEP: App loading states prefer @/components/core/skeleton types.
// HOW: div with animate-pulse background.
// EDIT: Rounded/size via className.
// RISK: Low

import { cn } from "cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
