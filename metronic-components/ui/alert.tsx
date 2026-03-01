import * as React from "react"

import { cn } from "@/lib/utils"

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'success' | 'destructive' | 'warning' | 'info'
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-gray-50 text-gray-900 border border-gray-200',
    success: 'bg-green-50 text-green-900 border border-green-200',
    destructive: 'bg-red-50 text-red-900 border border-red-200',
    warning: 'bg-yellow-50 text-yellow-900 border border-yellow-200',
    info: 'bg-blue-50 text-blue-900 border border-blue-200',
  }

  return (
    <div
      ref={ref}
      role="alert"
      className={cn("relative w-full rounded-lg border px-4 py-3 text-sm", variants[variant], className)}
      {...props}
    />
  )
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
