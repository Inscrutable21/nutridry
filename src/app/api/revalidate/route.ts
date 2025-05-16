import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { path, tag } = await request.json();
    
    // Revalidate both path and tag if provided
    if (path) {
      revalidatePath(path);
    }
    
    if (tag) {
      revalidateTag(tag);
    }
    
    return NextResponse.json({ 
      revalidated: true, 
      message: `Revalidated ${path ? `path: ${path}` : ''}${path && tag ? ' and ' : ''}${tag ? `tag: ${tag}` : ''}`,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { revalidated: false, message: 'Error revalidating' },
      { status: 500 }
    );
  }
}