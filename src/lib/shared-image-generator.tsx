import { ImageResponse } from 'next/og'
import { Icon } from '@/components/icon'
import { headkit } from '@/lib/headkit/client'

// Standard image size for both OG and Twitter
export const standardSize = {
  width: 1200,
  height: 630,
}

export async function generateSocialImage(alt: string = 'Site logo') {
  const { data: { branding } } = await headkit({
    revalidateTags: ["headkit:branding"],
    revalidateTime: 60
  }).getBranding();
  
  // Calculate square size for the icon (based on height to ensure it fits)
  const iconSize = Math.min(standardSize.height * 0.7, standardSize.width * 0.5);
  
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: "#89cfc2",
        }}
      >
        {branding?.iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={branding?.iconUrl} 
            alt={alt}
            style={{
              width: `${iconSize}px`,
              height: `${iconSize}px`,
              objectFit: 'contain',
            }} 
          />
        ) : (
          <div style={{ width: `${iconSize}px`, height: `${iconSize}px`, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.monoLogo />
          </div>
        )}
      </div>
    ),
    {
      ...standardSize,
    }
  )
} 