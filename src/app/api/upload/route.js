import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('user_session');
    
    if (!userIdCookie || !userIdCookie.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get form data with files
    const formData = await request.formData();
    const files = formData.getAll('files');
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }
    
    // Check file size limit (4MB per file)
    for (const file of files) {
      if (file.size > 4 * 1024 * 1024) {
        return NextResponse.json({ 
          error: 'File size exceeds 4MB limit' 
        }, { status: 400 });
      }
    }
    
    // Process files to base64
    const imageUrls = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        return `data:${file.type};base64,${buffer.toString('base64')}`;
      })
    );
    
    return NextResponse.json({ urls: imageUrls });
  } catch (error) {
    console.error('Error processing images:', error);
    return NextResponse.json(
      { error: 'Failed to process images' }, 
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
