import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

    // --- Input Validation ---
    if (!userId || !addressId || !paymentMethod || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields: userId, addressId, paymentMethod, and non-empty items array are required.' }, { status: 400 });
    }

    // --- Data Integrity Check and Calculation ---
    let subtotal = 0;
    for (const item of items) {
      // THIS IS THE CRITICAL CHECK. Ensure the data from your frontend is correct.
      if (!item.variantId || !item.productId || !item.quantity || !item.price) {
        return NextResponse.json({ error: `Invalid item in cart. Each item must have a productId, variantId, quantity, and price. Problem item: ${JSON.stringify(item)}` }, { status: 400 });
      }
      subtotal += item.price * item.quantity;
    }

    const total = subtotal + (shippingCost || 0);

    // --- Create the Order in the Database ---
    const newOrder = await prisma.order.create({
      data: {
        userId,
        addressId,
        paymentMethod,
        // The 'items' array, complete with variantId, is saved as JSON.
        // This is the root cause fix.
        items: items,
        subtotal,
        shippingCost: shippingCost || 0,
        total,
        status: 'pending', // Orders start as pending
      },
    });

    console.log(`New order created with ID: ${newOrder.id}`);

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
        return NextResponse.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}