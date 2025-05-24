import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma, Product as PrismaProduct, SizeVariant } from '@prisma/client';

// Define interface for the transformed product
interface TransformedProduct extends Omit<PrismaProduct, 'variants'> {
  variants?: SizeVariant[];
  price: number;
  stock: number;
  salePrice: number | null;
}

// Define response data structure
interface ProductsResponse {
  products: TransformedProduct[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  }
}

// Add caching headers to improve performance
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
        ]
      } : {})
    };

    // Check if we have cached data for this query - increase cache time
    const cacheKey = `products-${JSON.stringify(whereClause)}-${limit}-${page}`;
    const globalWithCache = global as any;
    
    if (!globalWithCache.productQueryCache) {
      globalWithCache.productQueryCache = {};
    }
    
    const cachedData = globalWithCache.productQueryCache[cacheKey];
    const now = Date.now();
    
    // Use cached data if available and not expired (increased to 30 minutes)
    if (cachedData && (now - cachedData.timestamp) < 1800000) {
      return NextResponse.json(cachedData.data, {
        headers: {
          'Cache-Control': 'public, max-age=1800, s-maxage=1800',
          'CDN-Cache-Control': 'public, max-age=1800',
        }
      });
    }

    // Optimize database query - only select necessary fields
    let products: any[] = [];
    let total: number = 0;

    try {
      // Execute optimized query with Promise.all for parallel execution
      const results = await Promise.all([
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
            // Only fetch first variant for performance
            variants: {
              select: {
                id: true,
                price: true,
                stock: true,
              },
              take: 1
            },
            createdAt: true
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.product.count({ where: whereClause })
      ]);
      
      products = results[0];
      total = results[1];
    } catch (dbError) {
      console.error(`Database query failed:`, dbError);
      throw dbError;
    }
    
    // Transform the data - simplified for performance
    const transformedProducts: TransformedProduct[] = products.map(product => {
      const defaultVariant = product.variants && product.variants.length > 0 
        ? product.variants[0] 
        : null;
      
      return {
        ...product,
        price: defaultVariant ? defaultVariant.price : 0,
        stock: defaultVariant ? defaultVariant.stock : 0,
        salePrice: null
      };
    });
    
    const result: ProductsResponse = {
      products: transformedProducts,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      }
    };
    
    // Cache the result
    globalWithCache.productQueryCache[cacheKey] = {
      data: result,
      timestamp: now
    };
    
    // Return with caching headers
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, max-age=1800, s-maxage=1800',
        'CDN-Cache-Control': 'public, max-age=1800',
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', message: error instanceof Error ? error.message : 'Database error' },
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
    
    // Check if the image data is too large
    if (typeof imageValue === 'string' && imageValue.length > 5 * 1024 * 1024) {
      return Response.json(
        { error: 'Image data is too large. Please use a smaller image (under 5MB).' },
        { status: 413 }
      );
    }
    
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
    
    // Create variants if any
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
    
    // Get the product with variants
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
