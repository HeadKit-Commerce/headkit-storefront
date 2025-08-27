import { ImageResponse } from "next/og";
import { headkit } from "@/lib/headkit/client";
import config from "@/headkit.config";

// Image metadata
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';
export const alt = 'Site logo';

// Image generation - Ultimate fallback with app name and primary color
export default async function OpenGraphImage() {
  try {
    const branding = await headkit({
      revalidateTags: ["headkit:branding"],
      revalidateTime: 60
    }).getBranding();
    
    const primaryColor = branding?.data?.branding?.primaryColor || config.metadata.appColor;
    const appName = config.metadata.appName;

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
            backgroundColor: primaryColor,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              fontSize: "72px",
              fontWeight: "700",
              color: "#FFFFFF",
              textAlign: "center",
              textShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            }}
          >
            {appName}
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  } catch {
    // Fallback if branding fetch fails
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
            backgroundColor: config.metadata.appColor,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              fontSize: "72px",
              fontWeight: "700",
              color: "#FFFFFF",
              textAlign: "center",
              textShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            }}
          >
            {config.metadata.appName}
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  }
} 