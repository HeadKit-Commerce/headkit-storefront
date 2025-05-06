import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Icon, type IconType } from "@/components/icon";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 text-lg",
  {
    variants: {
      variant: {
        // primary:
        //   "bg-linear-to-r from-purple-500 to-pink-500 text-white hover:to-blue-500 hover:shadow-button",
        primary:
          "bg-primary text-white hover:bg-primary/70 hover:shadow-button",
        secondary:
          "border-2 border-purple-800 bg-linear-to-r hover:from-lime-400 hover:to-lime-100",
        link: "text-purple-800 underline hover:text-purple-500",
        ghost: "",
      },
      size: {
        primary: "h-10 px-4 py-2",
        sm: "h-9 px-[10px]",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
      },
      loading: {
        true: "cursor-not-allowed",
      },
      disabled: {
        true: "cursor-not-allowed",
      },
    },
    compoundVariants: [
      {
        variant: "primary",
        loading: true,
        className: "bg-none bg-purple-500!",
      },
      {
        variant: "primary",
        disabled: true,
        className: "bg-none bg-gray-500!",
      },
      {
        variant: "secondary",
        loading: true,
        className: "from-lime-100! ",
      },
      {
        variant: "secondary",
        disabled: true,
        className: "bg-none border-gray-500! text-gray-500!",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "primary",
    },
  }
);

const iconVariants = cva("h-6 w-6", {
  variants: {
    variant: {
      primary: "stroke-white stroke-2",
      secondary: "stroke-purple-800 text-purple-800 stroke-2",
      link: "stroke-purple-800 group-hover:stroke-purple-800 stroke-2",
      ghost: "",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled">,
    VariantProps<typeof buttonVariants> {
  loadingText?: string;
  rightIcon?: IconType;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading,
      loadingText,
      disabled,
      rightIcon,
      children,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const RightIcon = rightIcon ? Icon[rightIcon] : null;
    return (
      <Comp
        className={cn(
          buttonVariants({
            variant,
            size,
            className,
            fullWidth,
            loading,
            disabled,
          })
        )}
        ref={ref}
        disabled={!!disabled}
        {...props}
      >
        <Slottable>
          {loading ? loadingText || "Processing..." : children}
        </Slottable>
        {loading ? (
          <Icon.loading className={cn("ml-4", iconVariants({ variant }))} />
        ) : RightIcon ? (
          <RightIcon className={cn("ml-4", iconVariants({ variant }))} />
        ) : null}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
