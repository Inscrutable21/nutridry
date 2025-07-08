import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

/**
 * JSDoc type definition for an item in the order.
 * @typedef {Object} OrderItem
 * @property {string} productId - The ID of the parent product.
 * @property {string} variantId - The specific ID of the size/color variant. THIS IS ESSENTIAL.
 * @property {number} quantity - The number of items purchased.
 * @property {string} name - The name of the item.
 * @property {number} price - The price of the item.
 */

/**
 * @param {import('next/server').NextRequest} request
 * @param {{ params: Promise<{ id: string }> }} context
 */
export async function GET(request, { params }) {
  try {
    // FIX: Await the params object before destructuring.
    const { id: orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { name: true, email: true, mobile: true } },
        address: true,
      },
    });
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Parse items if they're stored as a string
    let items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    
    // Ensure image URLs are absolute
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
        processedItem.image = '/images/placeholder.jpg';
      }
      
      return processedItem;
    });
    
    order.items = items;
    
    return NextResponse.json({ order });

  } catch (error) {
    console.error(`Error fetching order ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}

/**
 * @param {import('next/server').NextRequest} request
 * @param {{ params: Promise<{ id: string }> }} context
 */
export async function PATCH(request, { params }) {
  try {
    const { id: orderId } = await params;
    const { status } = await request.json();
    
    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }
    
    console.log(`Updating order ${orderId} status to ${status}`);
    
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { items: true, status: true }
    });

    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found for update' }, { status: 404 });
    }

    // Only reduce stock when an order is marked as completed
    if (status === 'completed' && currentOrder.status !== 'completed') {
      try {
        console.log(`Order ${orderId} marked as completed, updating stock...`);
        
        const items = typeof currentOrder.items === 'string' 
          ? JSON.parse(currentOrder.items) 
          : currentOrder.items;
        
        for (const item of items) {
          console.log(`Processing item: ${JSON.stringify(item)}`);
          
          if (item.variantId) {
            // Get current variant
            const variant = await prisma.sizeVariant.findUnique({
              where: { id: item.variantId },
              select: { stock: true }
            });
            
            if (variant) {
              // Calculate new stock value
              const newStock = Math.max(0, variant.stock - item.quantity);
              console.log(`Updating variant ${item.variantId} stock from ${variant.stock} to ${newStock}`);
              
              // Update with explicit new value instead of decrement
              await prisma.sizeVariant.update({
                where: { id: item.variantId },
                data: { stock: newStock }
              });
            }
          } else if (item.productId) {
            // Get current product
            const product = await prisma.product.findUnique({
              where: { id: item.productId },
              select: { stock: true }
            });
            
            if (product) {
              // Calculate new stock value
              const newStock = Math.max(0, product.stock - item.quantity);
              console.log(`Updating product ${item.productId} stock from ${product.stock} to ${newStock}`);
              
              // Update with explicit new value instead of decrement
              await prisma.product.update({
                where: { id: item.productId },
                data: { stock: newStock }
              });
            }
          } else {
            console.error(`Cannot update stock: Item is missing both variantId and productId: ${JSON.stringify(item)}`);
          }
        }
        console.log(`Stock update completed for order ${orderId}`);
      } catch (error) {
        console.error(`Error updating stock:`, error);
      }
    }
    
    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: { select: { name: true, email: true, mobile: true } },
        address: true,
      },
    });

    if (typeof updatedOrder.items === 'string') {
      updatedOrder.items = JSON.parse(updatedOrder.items);
    }
    return NextResponse.json({ order: updatedOrder, message: `Order status updated to ${status}` });
  } catch (error) {
    console.error(`Error updating order ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}










