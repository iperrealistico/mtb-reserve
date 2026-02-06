import { ImageResponse } from 'next/og'
import { getSiteSettings } from '@/lib/site-settings'

// We need to use Node.js runtime since Prisma doesn't work in Edge
export const runtime = 'nodejs'
export const contentType = 'image/png'
export const size = { width: 180, height: 180 }

export default async function AppleIcon() {
    const settings = await getSiteSettings()

    // If we have a favicon URL from Vercel Blob, fetch and return it
    const url = settings.faviconAppleUrl || settings.faviconUrl
    if (url) {
        try {
            const response = await fetch(url, { cache: 'force-cache' })
            if (response.ok) {
                const buffer = await response.arrayBuffer()
                return new Response(buffer, {
                    headers: {
                        'Content-Type': 'image/png',
                        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
                    },
                })
            }
        } catch (e) {
            console.error('Failed to fetch apple icon:', e)
            // Fallback to generated icon
        }
    }

    // Fallback: Generate a simple placeholder icon with "MTB" branding
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#1a1a2e',
                    borderRadius: 24,
                    color: 'white',
                    fontSize: 80,
                    fontWeight: 'bold',
                }}
            >
                MTB
            </div>
        ),
        { ...size }
    )
}
