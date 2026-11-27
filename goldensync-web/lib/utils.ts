// WHAT: Re-exports `cn` (class name helper) used to merge Tailwind CSS classes.
// HOW: Other files import { cn } from "@/lib/utils" instead of from "cn" directly.
// SCREEN: Nothing visible — helper only.
// EDIT: Keep this as a thin re-export unless the class helper package changes.
// RISK: Low
export { cn } from "cn"
