import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Define allowed methods
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
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
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();
    
    // Extract variants from the data
    const { variants, ...productDetails } = data;
    
    // Validate the data
    if (!data.name || !data.description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
    }
    
    // Ensure image is a non-empty string or set to default value
    const imageValue = productDetails.image && productDetails.image.trim() !== '' 
      ? productDetails.image 
      : '/placeholder.jpg'; // Use a default placeholder image
    
    // Update the product without using transactions
    try {
      // First update the main product
      const updatedProduct = await prisma.product.update({
        where: { id },
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
      
      // Then handle variants separately
      if (variants && variants.length > 0) {
        // Delete existing variants
        await prisma.sizeVariant.deleteMany({
          where: { productId: id },
        });
        
        // Create new variants one by one
        for (const variant of variants) {
          await prisma.sizeVariant.create({
            data: {
              size: variant.size || '',
              price: Number(variant.price) || 0,
              originalPrice: variant.originalPrice ? Number(variant.originalPrice) : null,
              stock: Number(variant.stock) || 0,
              productId: id,
            },
          });
        }
      }
      
      // Return the updated product with variants
      const productWithVariants = await prisma.product.findUnique({
        where: { id },
        include: { variants: true },
      });
      
      return NextResponse.json(productWithVariants);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ 
        error: `Database error: ${dbError instanceof Error ? dbError.message : String(dbError)}` 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ 
      error: `Failed to update product: ${error instanceof Error ? error.message : String(error)}` 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
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
