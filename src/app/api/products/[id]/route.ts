import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Add backward compatibility fields
    const defaultVariant = product.variants && product.variants.length > 0 
      ? product.variants[0] 
      : null;
    
    const transformedProduct = {
      ...product,
      // Add price and stock from the default variant for backward compatibility
      price: defaultVariant ? defaultVariant.price : 0,
      stock: defaultVariant ? defaultVariant.stock : 0,
      salePrice: null // For backward compatibility
    };
    
    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const data = await request.json();
    const { variants, ...productDetails } = data;
    
    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: productDetails,
    });
    
    // Handle variants - first delete existing ones
    await prisma.sizeVariant.deleteMany({
      where: { productId: id },
    });
    
    // Then create new ones
    if (variants && variants.length > 0) {
      await prisma.sizeVariant.createMany({
        data: variants.map((variant: {
          size: string;
          price: number;
          originalPrice?: number;
          stock: number;
        }) => ({
          size: variant.size || '',
          price: Number(variant.price) || 0,
          originalPrice: variant.originalPrice ? Number(variant.originalPrice) : null,
          stock: Number(variant.stock) || 0,
          productId: id,
        })),
      });
    }
    
    // Return the updated product with variants
    const productWithVariants = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });
    
    return NextResponse.json(productWithVariants);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    // Delete the product (variants will be deleted automatically due to cascade)
    await prisma.product.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
