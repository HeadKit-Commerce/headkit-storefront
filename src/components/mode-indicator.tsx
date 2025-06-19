"use client";

import { useAppContext } from "@/contexts/app-context";
import { cn } from "@/lib/utils";

export type PositionType = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface ModeIndicatorProps {
  position?: PositionType;
  showInProduction?: boolean;
  className?: string;
}

export function ModeIndicator({ 
  position = "bottom-right", 
  showInProduction = false,
  className 
}: ModeIndicatorProps) {
  const { isLiveMode, storeSettings, isLoading } = useAppContext();

  // Check environment variable to control visibility
  const showModeIndicator = process.env.NEXT_PUBLIC_SHOW_MODE_INDICATOR !== 'false';
  const forcedPosition = process.env.NEXT_PUBLIC_MODE_INDICATOR_POSITION as PositionType;
  
  // Use environment variable position if set, otherwise use prop
  const finalPosition = forcedPosition || position;

  // Don't show if disabled via environment variable
  if (!showModeIndicator) {
    return null;
  }

  // Don't show while loading
  if (isLoading) {
    return null;
  }

  // Don't show in production unless explicitly enabled
  if (isLiveMode && !showInProduction) {
    return null;
  }

  // Don't show if we don't have store settings
  if (!storeSettings) {
    return null;
  }

  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };

  const modeText = isLiveMode ? "LIVE" : "TEST";
  const modeColor = isLiveMode 
    ? "bg-green-500 border-green-600 text-white shadow-green-200/50" 
    : "bg-yellow-500 border-yellow-600 text-black shadow-yellow-200/50";

  const sourceText = process.env.NEXT_PUBLIC_STRIPE_LIVE_MODE !== undefined 
    ? "ENV" 
    : "STORE";

  return (
    <div
      className={cn(
        "fixed z-50 px-3 py-2 rounded-lg border-2 font-bold text-sm shadow-lg",
        "transition-all duration-300 hover:scale-105",
        "backdrop-blur-sm bg-opacity-90",
        positionClasses[finalPosition],
        modeColor,
        className
      )}
      title={`Payment mode: ${modeText} (Source: ${sourceText})`}
    >
      <div className="flex items-center gap-2">
        <div 
          className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            isLiveMode ? "bg-green-200" : "bg-yellow-200"
          )} 
        />
        <span>{modeText} MODE</span>
        <span className="text-xs opacity-75">({sourceText})</span>
      </div>
    </div>
  );
} 