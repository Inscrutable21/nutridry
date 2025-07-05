import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    
    // Validate stock value
    if (data.stock !== undefined && (isNaN(data.stock) || data.stock < 0)) {
      return NextResponse.json(
        { error: 'Stock must be a non-negative number' },
        { status: 400 }
      );
    }
    
    // Update the variant
    const updatedVariant = await prisma.productVariant.update({
      where: { id },
      data: {
        stock: data.stock !== undefined ? parseInt(data.stock, 10) : undefined,
      },
    });
    
    return NextResponse.json(updatedVariant);
  } catch (error) {
    console.error('Error updating variant:', error);
    return NextResponse.json(
      { error: 'Failed to update variant' },
      { status: 500 }
    );
  }
}