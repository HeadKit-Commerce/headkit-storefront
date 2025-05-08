import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, tag, secret } = body;

    // Check for secret to confirm this is a valid request
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { message: 'Invalid secret' },
        { status: 401 }
      );
    }

    // Revalidate path if provided
    if (path) {
      revalidatePath(path);
    }

    // Revalidate tag if provided
    if (tag) {
      revalidateTag(tag);
    }

    return NextResponse.json(
      { 
        revalidated: true, 
        message: `Revalidated ${path ? `path: ${path}` : ''} ${tag ? `tag: ${tag}` : ''}` 
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