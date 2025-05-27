import { standardSize, generateSocialImage } from '@/lib/shared-image-generator'

// Image metadata
export const size = standardSize
export const contentType = 'image/png'
export const alt = 'Site logo'

// Image generation
export default async function TwitterImage() {
  return generateSocialImage(alt)
} 