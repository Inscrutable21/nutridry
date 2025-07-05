'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { CartItem } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, variant: string | null) => void;
  updateQuantity: (id: string, quantity: number, variant: string | null) => void;
  clearCart: () => void;
  syncCartWithUser: () => Promise<void>;
}

// Create context with default values
const CartContext = createContext<CartContextType>({
  items: [],
  cartCount: 0,
  cartTotal: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  syncCartWithUser: async () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const { user, isAuthenticated } = useAuth() || {};
  
  // Add at the top of the component:
  const prevAuthRef = useRef<boolean>(false);
  const isSyncingRef = useRef(false);
  
  // Load cart from localStorage or user's saved cart
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated && user) {
        // If user is logged in, fetch their cart from the server
        try {
          const response = await fetch('/api/user/cart');
          if (response.ok) {
            const data = await response.json();
            if (data.items && Array.isArray(data.items)) {
              setItems(data.items);
            }
          }
        } catch (error) {
          console.error('Failed to fetch user cart:', error);
          // Fall back to localStorage if API fails
          loadFromLocalStorage();
        }
      } else {
        // If not logged in, use localStorage
        loadFromLocalStorage();
      }
    };
    
    const loadFromLocalStorage = () => {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setItems(parsedCart);
        } catch (error) {
          console.error('Failed to parse cart from localStorage:', error);
        }
      }
    };
    
    loadCart();
  }, [isAuthenticated, user]);
  
  // Save cart to localStorage and/or server whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      // Always save to localStorage as a fallback
      if (items.length > 0) {
        try {
          // First try to save with minimal data
          const minimalItems = items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            variant: item.variant,
            // Exclude image and other large properties
          }));
          
          localStorage.setItem('cart', JSON.stringify(minimalItems));
        } catch (error) {
          console.error('Failed to save cart to localStorage:', error);
          
          try {
            // If still failing, try with even less data
            const essentialItems = items.map(item => ({
              id: item.id,
              quantity: item.quantity,
              variant: item.variant,
            }));
            
            localStorage.setItem('cart', JSON.stringify(essentialItems));
          } catch (storageError) {
            console.error('Still failed to save essential cart data:', storageError);
            // At this point, we'll rely on server-side storage only
          }
        }
      } else {
        localStorage.removeItem('cart');
      }
      
      // If user is logged in, also save to server
      if (isAuthenticated && user) {
        try {
          await fetch('/api/user/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items }),
          });
        } catch (error) {
          console.error('Failed to save cart to server:', error);
        }
      }
      
      // Calculate cart total and count
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const count = items.reduce((sum, item) => sum + item.quantity, 0);
      
      setCartTotal(total);
      setCartCount(count);
    };
    
    saveCart();
  }, [items, isAuthenticated, user]);
  
  // Sync cart with user when authentication state changes
  const syncCartWithUser = async () => {
    if (isAuthenticated && user && !isSyncingRef.current) {
      try {
        // Set syncing flag to prevent multiple simultaneous syncs
        isSyncingRef.current = true;
        
        // First, send local cart to server only if we have local items
        const localItems = JSON.parse(localStorage.getItem('cart') || '[]');
        if (localItems.length > 0) {
          await fetch('/api/user/cart/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items: localItems }),
          });
          
          // Clear local storage after successful sync
          localStorage.removeItem('cart');
        }
        
        // Then fetch the merged cart from server
        const response = await fetch('/api/user/cart');
        if (response.ok) {
          const data = await response.json();
          if (data.items && Array.isArray(data.items)) {
            setItems(data.items);
          }
        }
      } catch (error) {
        console.error('Failed to sync cart with user:', error);
      } finally {
        // Reset syncing flag
        isSyncingRef.current = false;
      }
    }
  };
  
  // Add useEffect to sync cart when auth state changes
  useEffect(() => {
    // Only sync once when user logs in
    if (isAuthenticated && user && !prevAuthRef.current && !isSyncingRef.current) {
      syncCartWithUser();
    }
    
    // Track previous auth state
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, user]);

  const addToCart = (item: CartItem) => {
    // Validate the item has all required properties
    if (!item.id || !item.name || item.price === undefined) {
      console.error('Invalid cart item:', item);
      return;
    }
    
    setItems(prevItems => {
      // Check if the item is already in the cart (matching both id and variant)
      const existingItemIndex = prevItems.findIndex(
        cartItem => cartItem.id === item.id && cartItem.variant === item.variant
      );
      
      let newItems;
      
      if (existingItemIndex >= 0) {
        // If the item exists, update its quantity
        newItems = [...prevItems];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + item.quantity
        };
      } else {
        // If the item doesn't exist, add it to the cart
        newItems = [...prevItems, item];
      }
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(newItems));
      }
      
      return newItems;
    });
    
    // Update cart count - this was incorrect, we should update based on the item quantity
    setCartCount(prev => prev + item.quantity);
  }
  
  const removeFromCart = (id: string, variant: string | null) => {
    setItems(prevItems => 
      prevItems.filter(item => !(item.id === id && item.variant === variant))
    );
  };
  
  const updateQuantity = (id: string, quantity: number, variant: string | null) => {
    if (quantity < 1) return;
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id && item.variant === variant ? { ...item, quantity } : item
      )
    );
  };
  
  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
  };
  
  // Add a useEffect to recalculate cart count whenever items change
  useEffect(() => {
    // Calculate cart total and count
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    
    setCartTotal(total);
    setCartCount(count);
  }, [items]);

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      cartTotal,
      cartCount,
      syncCartWithUser
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
