import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { products } = await request.json();

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: products must be a non-empty array' },
        { status: 400 }
      );
    }

    // Create all products in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const createdProducts = [];

      for (const productData of products) {
        // Extract variants to create separately
        const { variants, ...productDetails } = productData;

        // Create the product
        const product = await tx.product.create({
          data: {
            ...productDetails,
            // Set default values for required fields if not provided
            rating: productDetails.rating || 0,
            reviews: productDetails.reviews || 0,
            bestseller: productDetails.bestseller || false,
            featured: productDetails.featured || false,
          },
        });

        // Create variants if any
        if (variants && variants.length > 0) {
          await tx.sizeVariant.createMany({
            data: variants.map((variant: any) => ({
              ...variant,
              productId: product.id,
            })),
          });
        }

        createdProducts.push(product);
      }

      return createdProducts;
    });

    return NextResponse.json({
      success: true,
      count: result.length,
      message: `Successfully created ${result.length} products`,
    });
  } catch (error) {
    console.error('Error in bulk product upload:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload products' },
      { status: 500 }
    );
  }
}