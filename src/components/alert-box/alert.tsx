import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-[6px] border-[2px] p-[20px] flex",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        danger: "bg-gradient-to-r from-[#FDECF5] to-[#FCDAEA] border-pink-300",
        warning: "bg-gradient-to-r from-[#FFF6EB] to-[#FFE3C2] border-orange-300",
        success: "bg-gradient-to-r from-[#F9FFEB] to-[#F3FFD6] border-lime-500",
        notice: "bg-gradient-to-r from-[#EDF9FC] to-[#CAEEF6] border-blue-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const alertTitleVariants = cva(
    "font-extrabold leading-none tracking-tight",
    {
      variants: {
        variant: {
          default: "bg-background text-foreground",
          danger: "text-pink-800",
          warning: "text-orange-600",
          success: "text-lime-800",
          notice: "text-blue-600",
        },
      },
      defaultVariants: {
        variant: "default",
      },
    }
  )

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & VariantProps<typeof alertTitleVariants>
>(({ className, variant, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(alertTitleVariants({ variant }), className)}
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
    className={cn("text-grey-800 leading-[18px]", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription, alertVariants }
