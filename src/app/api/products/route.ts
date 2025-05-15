import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// In the GET function, add search query parameter handling
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const bestseller = searchParams.get('bestseller') === 'true';
    const featured = searchParams.get('featured') === 'true';
    const searchQuery = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    
    // Build optimized query
    const skip = (page - 1) * limit;
    const whereClause = {
      ...(category ? { category } : {}),
      ...(bestseller ? { bestseller: true } : {}),
      ...(featured ? { featured: true } : {}),
      ...(searchQuery ? {
        OR: [
          { name: { contains: searchQuery, mode: Prisma.QueryMode.insensitive } },
          { category: { contains: searchQuery, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: searchQuery, mode: Prisma.QueryMode.insensitive } },
        ]
      } : {})
    };

    // Execute optimized query with Promise.all for parallel execution
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          category: true,
          bestseller: true,
          featured: true,
          rating: true,
          reviews: true,
          // Only fetch variants if needed
          variants: {
            select: {
              id: true,
              size: true,
              price: true,
              originalPrice: true,
              stock: true,
            }
          },
          createdAt: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where: whereClause })
    ]);
    
    // Transform the data to maintain backward compatibility
    const transformedProducts = products.map(product => {
      // Get the default variant (first one) for backward compatibility
      const defaultVariant = product.variants && product.variants.length > 0 
        ? product.variants[0] 
        : null;
      
      return {
        ...product,
        // Add price and stock from the default variant for backward compatibility
        price: defaultVariant ? defaultVariant.price : 0,
        stock: defaultVariant ? defaultVariant.stock : 0,
        salePrice: null // For backward compatibility
      };
    });
    
    const result = {
      products: transformedProducts,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      }
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Extract variants from the data
    const { variants, ...productDetails } = data;
    
    // Validate the data
    if (!data.name || !data.description) {
      return Response.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }
    
    // Ensure image is a non-empty string or set to default value
    const imageValue = productDetails.image && productDetails.image.trim() !== '' 
      ? productDetails.image 
      : '/placeholder.jpg'; // Use a default placeholder image
    
    // Create product without using a transaction
    const product = await prisma.product.create({
      data: {
        name: productDetails.name,
        description: productDetails.description,
        longDescription: productDetails.longDescription || null,
        image: imageValue, // Use the validated image value
        images: productDetails.images || [],
        category: productDetails.category,
        rating: productDetails.rating || 0,
        reviews: productDetails.reviews || 0,
        bestseller: productDetails.bestseller || false,
        featured: productDetails.featured || false,
        benefits: productDetails.benefits || [],
        features: productDetails.features || [],
        usageSuggestions: productDetails.usageSuggestions || [],
        nutritionalInfo: productDetails.nutritionalInfo || {},
        specs: productDetails.specs || {},
      },
    });
    
    // Create variants if provided
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        await prisma.sizeVariant.create({
          data: {
            size: variant.size || '',
            price: Number(variant.price) || 0,
            originalPrice: variant.originalPrice ? Number(variant.originalPrice) : null,
            stock: Number(variant.stock) || 0,
            productId: product.id,
          },
        });
      }
    }
    
    // Return the created product with variants
    const productWithVariants = await prisma.product.findUnique({
      where: { id: product.id },
      include: { variants: true },
    });
    
    return Response.json({ product: productWithVariants }, { status: 201 });
  } catch (error) {
    console.error('Error saving product:', error);
    return Response.json(
      { error: `Error saving product: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
