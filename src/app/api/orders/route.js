import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { emailService } from '@/lib/email-service';

/**
 * JSDoc type definition for an item received from the frontend cart.
 * @typedef {Object} CartItem
 * @property {string} productId - The ID of the parent product.
 * @property {string} variantId - The specific ID of the size/color variant. THIS IS ESSENTIAL.
 * @property {number} quantity - The number of items purchased.
 * @property {string} name - The name of the item.
 * @property {number} price - The price of the item.
 */

/**
 * POST handler to create a new order from cart items.
 * @param {import('next/server').NextRequest} request
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, addressId, paymentMethod, items, shippingCost } = body;

    console.log('Received order request:', { 
      userId, 
      addressId, 
      paymentMethod, 
      itemsLength: items?.length,
      shippingCost 
    });
    
    // Debug log to see what image URLs are coming in
    console.log('Item images:', items.map(item => ({ 
      name: item.name, 
      image: item.image,
      productId: item.productId,
      variantId: item.variantId
    })));

    // Validate input
    if (!userId || !addressId || !paymentMethod || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Process items to ensure image URLs are correct
    const processedItems = items.map(item => {
      // Ensure the item has all required fields
      if (!item.name || !item.price || !item.quantity) {
        throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
      }
      
      return {
        ...item,
        // Ensure price is a number
        price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
      };
    });

    // Calculate subtotal
    const subtotal = processedItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    const total = subtotal + (shippingCost || 0);

    // --- Create the Order in the Database ---
    const newOrder = await prisma.order.create({
      data: {
        userId,
        addressId,
        paymentMethod,
        // Save the processed items with fixed image URLs
        items: processedItems,
        subtotal,
        shippingCost: shippingCost || 0,
        total,
        status: 'pending', // Orders start as pending
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        address: true
      }
    });

    console.log(`New order created with ID: ${newOrder.id}`);
    console.log('Saved order items:', newOrder.items);

    // Send order confirmation email
    try {
      await emailService.sendOrderConfirmation({
        email: newOrder.user.email,
        customerName: newOrder.user.name,
        items: newOrder.items,
        address: newOrder.address,
        orderId: newOrder.id,
        total: newOrder.total,
        orderDate: newOrder.createdAt
      });
      console.log(`Order confirmation email sent to ${newOrder.user.email}`);
    } catch (emailError) {
      // Log the error but don't fail the order creation
      console.error('Failed to send order confirmation email:', emailError);
    }

    return NextResponse.json(newOrder, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to create order', details: errorMessage }, { status: 500 });
  }
}

/**
 * GET handler to fetch all orders (optional, for an admin dashboard).
 * @param {import('next/server').NextRequest} request
 */
export async function GET(request) {
    try {
        const orders = await prisma.order.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        
        // Process orders to ensure all have properly formatted items with images
        const processedOrders = orders.map(order => {
          // Parse items if they're stored as a string
          let items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
          
          // Ensure all items have proper image URLs
          items = items.map(item => {
            // Make a copy to avoid mutating the original
            const processedItem = { ...item };
            
            // Ensure image URLs are properly formatted with absolute paths
            if (processedItem.image) {
              // Skip data URLs (they're already complete)
              if (processedItem.image.startsWith('data:')) {
                // Keep data URLs as they are
              }
              // If image is a relative path, make it absolute
              else if (!processedItem.image.startsWith('http') && !processedItem.image.startsWith('/')) {
                processedItem.image = '/' + processedItem.image;
              }
              
              // Fix common image path issues
              if (processedItem.image.startsWith('/products/') && !processedItem.image.startsWith('/images/products/')) {
                processedItem.image = '/images' + processedItem.image;
              }
            } else {
              // If no image, use placeholder
              processedItem.image = '/placeholder.jpg';
            }
            
            return processedItem;
          });
          
          return {
            ...order,
            items
          };
        });

        return NextResponse.json({ orders: processedOrders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}









