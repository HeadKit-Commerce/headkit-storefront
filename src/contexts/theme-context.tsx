"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Branding } from '@/lib/headkit/generated';
import { getBranding } from '@/lib/headkit/actions';

interface ThemeContextType {
  primaryColor: string;
  secondaryColor: string;
  primaryTextColor: string;
  branding: Branding | null;
  isLoading: boolean;
}

const defaultTheme: ThemeContextType = {
  primaryColor: '#ff0000',
  secondaryColor: '#7300ff',
  primaryTextColor: '#ffffff',
  branding: null,
  isLoading: true,
};

// Function to determine if a color is dark or light
const isColorDark = (hexColor: string): boolean => {
  // Handle colors with transparency or without # prefix
  const color = hexColor.charAt(0) === '#' ? hexColor.substring(1) : hexColor;
  
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
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq < 128; // < 128 is considered dark
};

// Function to get appropriate text color based on background
const getTextColorForBackground = (bgColor: string): string => {
  return isColorDark(bgColor) ? '#ffffff' : '#000000';
};

const ThemeContext = createContext<ThemeContextType>(defaultTheme);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<ThemeContextType>(defaultTheme);

  useEffect(() => {
    const loadBranding = async () => {
      try {
        const response = await getBranding();
        if (response?.data?.branding) {
          const primaryColor = response.data.branding.primaryColor || defaultTheme.primaryColor;
          const secondaryColor = response.data.branding.secondaryColor || defaultTheme.secondaryColor;
          const primaryTextColor = getTextColorForBackground(primaryColor);
          
          setTheme({
            primaryColor,
            secondaryColor,
            primaryTextColor,
            branding: response.data.branding,
            isLoading: false,
          });
          
          // Apply CSS variables to :root
          document.documentElement.style.setProperty('--color-primary', primaryColor);
          document.documentElement.style.setProperty('--color-secondary', secondaryColor);
          document.documentElement.style.setProperty('--color-primary-text', primaryTextColor);
        } else {
          setTheme({ ...defaultTheme, isLoading: false });
        }
      } catch (error) {
        console.error('Error loading branding:', error);
        setTheme({ ...defaultTheme, isLoading: false });
      }
    };

    loadBranding();
  }, []);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}; 