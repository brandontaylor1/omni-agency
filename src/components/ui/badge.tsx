import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"


import { cn } from "@/lib/utils"

// const badgeVariants = cva(
//   "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
//   {
//     variants: {
//       variant: {
//         default:
//           "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
//         secondary:
//           "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
//         destructive:
//           "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
//         outline: "text-foreground",
//         elite: "border-transparent bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
//         premium: "border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
//         standard: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
//         developing: "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
//         prospect: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
//       },
//     },
//     defaultVariants: {
//       variant: "default",
//     },
//   }
// )
//
// export interface BadgeProps
//   extends React.HTMLAttributes<HTMLDivElement>,
//     VariantProps<typeof badgeVariants> {}
//
// function Badge({ className, variant, ...props }: BadgeProps) {
//   return (
//     <div className={cn(badgeVariants({ variant }), className)} {...props} />
//   )
// }


const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
          success:
            "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          elite: 
            "border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
          premium:
            "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
          standard:
            "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          developing:
            "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
          prospect:
            "border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        success: 
          "border-transparent bg-green-500 text-white hover:bg-green-500/80",
        warning:
          "border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80",
        info:
          "border-transparent bg-blue-500 text-white hover:bg-blue-500/80",
        elite:
          "border-transparent bg-purple-600 text-white hover:bg-purple-600/80",
        premium:
          "border-transparent bg-blue-600 text-white hover:bg-blue-600/80",
        standard:
          "border-transparent bg-green-600 text-white hover:bg-green-600/80",
        developing:
          "border-transparent bg-yellow-600 text-white hover:bg-yellow-600/80",
        prospect:
          "border-transparent bg-gray-600 text-white hover:bg-gray-600/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
