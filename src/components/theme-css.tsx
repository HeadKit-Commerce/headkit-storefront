import { Branding } from '@/lib/headkit/generated';

interface ThemeCSSProps {
  branding: Branding | null;
}

// Default theme colors
const defaultTheme = {
  primaryColor: '#7f54b3',
  secondaryColor: '#000000',
  primaryTextColor: '#ffffff',
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

export function ThemeCSS({ branding }: ThemeCSSProps) {
  const primaryColor = branding?.primaryColor || defaultTheme.primaryColor;
  const secondaryColor = branding?.secondaryColor || defaultTheme.secondaryColor;
  const primaryTextColor = getTextColorForBackground(primaryColor);

  const cssVariables = `
    :root {
      --color-primary: ${primaryColor};
      --color-secondary: ${secondaryColor};
      --color-primary-text: ${primaryTextColor};
    }
  `;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: cssVariables,
      }}
    />
  );
} 