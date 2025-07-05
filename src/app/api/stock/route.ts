import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// This remains essential to prevent Next.js server-side caching
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    const whereClause = {
      ...(productId ? { id: productId } : {}),
    };

    // --- THE FIX: START FROM THE PRODUCT MODEL ---
    // 1. Query the Product model directly so we can sort by its indexed 'name' field.
    // This is highly efficient and avoids the in-memory sort limit.
    const productsWithVariants = await prisma.product.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc', // This now uses the index on the Product collection directly.
      },
      select: {
        // Select only the fields needed from the product
        id: true,
        name: true,
        image: true,
        category: true,
        // Include the related variants
        variants: {
          select: {
            id: true,
            size: true,
            price: true,
            stock: true,
            productId: true, // needed for the final object
          },
        },
      },
    });

    // 2. Reshape the data from a nested structure to the flat list your frontend expects.
    // The result from Prisma is `[Product{variants: [...]}, Product{variants: [...]}]`
    // We need to transform it into `[Variant{product: {...}}, Variant{product: {...}}]`
    const variants = productsWithVariants.flatMap((product) =>
      product.variants.map((variant) => ({
        // Spread the variant details
        ...variant,
        // Manually attach the parent product's details
        product: {
          id: product.id,
          name: product.name,
          image: product.image || null, // Ensure image is not undefined
          category: product.category,
        },
      }))
    );

    // 3. Return the correctly sorted and formatted flat list of variants.
    return NextResponse.json(
      { variants },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching stock data:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data: ' + errorMessage },
      { status: 500 }
    );
  }
}