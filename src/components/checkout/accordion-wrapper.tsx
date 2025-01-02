"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  order: number;
  title: string;
  isActive: boolean;
  isCompleted: boolean;
  clickable?: boolean;
  handleAccordionClick: () => void;
  children: React.ReactNode;
  briefValue?: string;
  rightMenu?: React.ReactNode;
  showButton?: boolean;
  buttonLabel?: string;
  buttonOnClick?: () => void;
  disabled?: boolean;
}

const AccordionWrapper = ({
  order,
  title,
  isActive,
  isCompleted,
  clickable = false,
  handleAccordionClick,
  children,
  briefValue,
  rightMenu,
  showButton = false,
  buttonLabel = "Continue",
  buttonOnClick,
  disabled = false,
}: Props) => {
  return (
    <div
      className={cn(
        "relative mb-2 px-5 py-5 md:px-10 md:py-5 rounded-md bg-white border transition-all",
        {
          "border-purple-500": isActive,
          "cursor-pointer": isCompleted && !isActive && clickable,
          "opacity-50": disabled,
        }
      )}
      onClick={disabled || !clickable ? undefined : handleAccordionClick}
    >
      {disabled && (
        <div className="absolute inset-0 bg-white bg-opacity-50 cursor-not-allowed"></div>
      )}

      <div className="flex justify-between items-center">
        <div className={cn("flex items-start gap-2 text-2xl font-extrabold", {
          "text-purple-500": isActive,
        })}>
          <span>{order}.</span>
          <span>{title}</span>
        </div>
        {isActive && rightMenu && <div className="flex">{rightMenu}</div>}
        {!isActive && isCompleted && briefValue && (
          <div className="text-gray-900 max-w-[50%] text-right line-clamp-2" dangerouslySetInnerHTML={{ __html: briefValue }} />
        )}
      </div>

      {isActive && (
        <div className="mt-4">
          {children}
          {showButton && (
            <Button
              variant="primary"
              className="mt-4 w-full"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering accordion click
                if (buttonOnClick) buttonOnClick();
              }}
              rightIcon="arrowRight"
            >
              {buttonLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export { AccordionWrapper };
