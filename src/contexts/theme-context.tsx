"use client";

import React, { createContext, useContext, useState } from "react";
import { Branding } from "@/lib/headkit/generated";

interface ThemeContextType {
  primaryColor: string;
  secondaryColor: string;
  primaryTextColor: string;
  branding: Branding | null;
  isLoading: boolean;
}

const defaultTheme: ThemeContextType = {
  primaryColor: "#000000",
  secondaryColor: "#000000",
  primaryTextColor: "#ffffff",
  branding: null,
  isLoading: false,
};

// Function to determine if a color is dark or light
const isColorDark = (hexColor: string): boolean => {
  // Handle colors with transparency or without # prefix
  const color = hexColor.charAt(0) === "#" ? hexColor.substring(1) : hexColor;

  // Convert hex to RGB
  let r: number, g: number, b: number;

  // Handle different hex formats (3 digits, 6 digits)
  if (color.length === 3) {
    r = parseInt(color.charAt(0) + color.charAt(0), 16);
    g = parseInt(color.charAt(1) + color.charAt(1), 16);
    b = parseInt(color.charAt(2) + color.charAt(2), 16);
  } else if (color.length >= 6) {
    r = parseInt(color.substring(0, 2), 16);
    g = parseInt(color.substring(2, 4), 16);
    b = parseInt(color.substring(4, 6), 16);
  } else {
    // If invalid format, default to considering it as light color
    return false;
  }

  // Calculate perceived brightness using YIQ formula
  // This gives better results for human perception than simple average
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq < 128; // < 128 is considered dark
};

// Function to get appropriate text color based on background
const getTextColorForBackground = (bgColor: string): string => {
  return isColorDark(bgColor) ? "#ffffff" : "#000000";
};

const ThemeContext = createContext<ThemeContextType>(defaultTheme);

export const useTheme = () => useContext(ThemeContext);

// Accept branding data from server components instead of fetching it
export const ThemeProvider = ({
  children,
  initialBranding = null,
}: {
  children: React.ReactNode;
  initialBranding?: Branding | null;
}) => {
  const [theme] = useState<ThemeContextType>(() => {
    if (initialBranding) {
      const primaryColor =
        initialBranding.primaryColor || defaultTheme.primaryColor;
      const secondaryColor =
        initialBranding.secondaryColor || defaultTheme.secondaryColor;
      const primaryTextColor = getTextColorForBackground(primaryColor);

      return {
        primaryColor,
        secondaryColor,
        primaryTextColor,
        branding: initialBranding,
        isLoading: false,
      };
    }
    return defaultTheme;
  });

  // CSS variables are now injected server-side via ThemeCSS component
  // No need for client-side useEffect to prevent color flashing

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};
