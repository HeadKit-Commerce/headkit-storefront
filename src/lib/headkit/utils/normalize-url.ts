/**
 * Helper function to normalize URLs from backend to frontend
 * Replaces the backend domain with the frontend domain while preserving the path
 * Always trims trailing slashes for consistency
 */
export function normalizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  try {
    // Parse the URL to extract the path
    const urlObj = new URL(url);
    let path = urlObj.pathname;
    
    // Trim trailing slash unless it's the root path
    if (path !== "/" && path.endsWith("/")) {
      path = path.slice(0, -1);
    }
    
    // Construct the new URL with frontend domain
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "";
    return `${frontendUrl}${path}`;
  } catch {
    // If URL parsing fails, return null
    return null;
  }
}

