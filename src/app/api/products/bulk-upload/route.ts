import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Set a longer timeout for this specific route
export const maxDuration = 60; // 60 seconds

export async function POST(request: Request) {
  try {
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      console.error('Error parsing request JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { products } = requestBody;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: products must be a non-empty array' },
        { status: 400 }
      );
    }

    // Limit the number of products to prevent timeouts
    const MAX_PRODUCTS = 50; // Reduced from 100 to 50
    if (products.length > MAX_PRODUCTS) {
      return NextResponse.json(
        { error: `Too many products. Maximum allowed is ${MAX_PRODUCTS}` },
        { status: 400 }
      );
    }

    // Process in smaller batches to avoid timeouts
    const BATCH_SIZE = 10;
    const results = [];

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      
      // Process each batch in a separate transaction
      const batchResults = await prisma.$transaction(async (tx) => {
        const createdProducts = [];

        for (const productData of batch) {
          try {
            // Extract variants to create separately
            const { variants, ...productDetails } = productData;

            // Create the product with proper field handling
            const product = await tx.product.create({
              data: {
                ...productDetails,
                // Set default values for required fields if not provided
                rating: productDetails.rating || 0,
                reviews: productDetails.reviews || 0,
                bestseller: productDetails.bestseller || false,
                featured: productDetails.featured || false,
                // Only include newArrival if it exists in the schema
                ...(productDetails.newArrival !== undefined && { newArrival: productDetails.newArrival || false }),
              },
            });

            // Create variants if any
            if (variants && variants.length > 0) {
              await tx.sizeVariant.createMany({
                data: variants.map((variant: {
                  size?: string;
                  price?: number | string;
                  originalPrice?: number | string | null;
                  stock?: number | string;
                }) => ({
                  productId: product.id,
                  size: variant.size || '',
                  price: Number(variant.price) || 0,
                  originalPrice: variant.originalPrice ? Number(variant.originalPrice) : null,
                  stock: Number(variant.stock) || 0
                })),
              });
            }

            createdProducts.push(product);
          } catch (productError) {
            console.error(`Error creating product:`, productError);
            throw new Error(`Error creating product: ${productError instanceof Error ? productError.message : String(productError)}`);
          }
        }

        return createdProducts;
      }, {
        timeout: 30000 // 30 second timeout for each batch transaction
      });

      results.push(...batchResults);
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      message: `Successfully created ${results.length} products`,
    });
  } catch (error) {
    console.error('Error in bulk product upload:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload products' },
      { status: 500 }
    );
  }
}
