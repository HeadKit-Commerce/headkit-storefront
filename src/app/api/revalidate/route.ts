import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paths, tags, secret } = body; // Removed singular 'path' and 'tag'

    // Check secret in header first (industry standard), then body (legacy support)
    const headerSecret = request.headers.get('x-revalidation-secret');
    const providedSecret = headerSecret || secret;

    if (providedSecret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { message: 'Invalid secret' },
        { status: 401 }
      );
    }

    const revalidatedPaths: string[] = [];
    const revalidatedTags: string[] = [];

    // Revalidate multiple paths
    if (paths && Array.isArray(paths)) {
      console.log('Revalidating paths:', paths);
      paths.forEach((p: string) => {
        revalidatePath(p);
        revalidatedPaths.push(p);
      });
    }

    // Revalidate multiple tags with "max" profile for on-demand revalidation
    if (tags && Array.isArray(tags)) {
      console.log('Revalidating tags:', tags);
      tags.forEach((t: string) => {
        revalidateTag(t, "max"); // Use max profile for webhook-triggered revalidation
        revalidatedTags.push(t);
      });
    }

    return NextResponse.json(
      { 
        revalidated: true,
        revalidatedPaths,
        revalidatedTags,
        message: `Revalidated ${revalidatedPaths.length} paths and ${revalidatedTags.length} tags`
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { message: 'Error revalidating' },
      { status: 500 }
    );
  }
}
