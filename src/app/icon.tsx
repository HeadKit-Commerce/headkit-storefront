import { getBranding } from '@/lib/headkit/actions';
import { ImageResponse } from 'next/og'
import { Icon as IconComponent } from '@/components/icon'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/svg+xml'

// Image generation
export default async function Icon() {
  const { data: { branding } } = await getBranding();
  return new ImageResponse(
    (
      // ImageResponse JSX element
      // eslint-disable-next-line @next/next/no-img-element
      <>{branding?.iconUrl ? <img src={branding?.iconUrl} alt="Icon" /> : <IconComponent.monoLogo />}</>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported icons size metadata
      // config to also set the ImageResponse's width and height.
      ...size,
    }
  )
}