import { getBranding } from "@/lib/headkit/actions";
import { ImageResponse } from "next/og";
import { Icon as IconComponent } from "@/components/icon";
import { NextRequest } from "next/server";

// Image generation
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sizeParam = searchParams.get("size");

  // Default to 192 if no size is provided, or if an invalid size is provided
  const size = sizeParam === "512" ? 512 : 192;

  const {
    data: { branding },
  } = await getBranding();

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <>
        {branding?.iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={branding?.iconUrl} alt="Icon" />
        ) : (
          <IconComponent.monoLogo />
        )}
      </>
    ),
    // ImageResponse options
    {
      width: size,
      height: size,
    }
  );
} 