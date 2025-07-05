import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Type for the incoming request body
interface UpdateStockRequestBody {
  variantId: string;
  stock: number;
}

export async function POST(request: Request) {
  try {
    const data: UpdateStockRequestBody = await request.json();
    const { variantId, stock } = data;
    
    // Validate input
    if (!variantId || stock === undefined || stock < 0 || isNaN(stock)) {
      return NextResponse.json(
        { error: 'Invalid input. Variant ID and non-negative stock value required.' },
        { status: 400 }
      );
    }
    
    // Update the variant stock
    const updatedVariant = await prisma.sizeVariant.update({
      where: { id: variantId },
      data: { stock: parseInt(String(stock), 10) }, // Ensure stock is an integer
      include: {
        product: {
          select: {
            name: true
          }
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      message: `Updated stock for ${updatedVariant.product.name} (${updatedVariant.size})`,
      variant: updatedVariant
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    // Provide a more specific error message if possible
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json(
      { error: 'Failed to update stock.', details: errorMessage },
      { status: 500 }
    );
  }
}