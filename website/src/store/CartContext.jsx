import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const CART_STORAGE_KEY = 'pakkam_guest_cart';
const ADDRESS_STORAGE_KEY = 'pakkam_guest_address';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [deliveryAddress, setDeliveryAddress] = useState(() => {
    try {
      const saved = localStorage.getItem(ADDRESS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      // quiet
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      if (deliveryAddress) {
        localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(deliveryAddress));
      }
    } catch (e) {
      // quiet
    }
  }, [deliveryAddress]);

  const addToCart = (product, selectedUnit = '1 kg', quantity = 1) => {
    if (!product || !product._id) return;
    const unit = selectedUnit || product.unit || '1 kg';
    const mrp = product.MRP || product.marketPrice || product.price || 0;
    const price = product.finalPrice || product.sellingPrice || product.discountPrice || product.price || mrp;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.productId === product._id && item.selectedUnit === unit
      );
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            productId: product._id,
            product,
            name: product.name,
            image: product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
            selectedUnit: unit,
            quantity,
            price,
            mrp,
          },
        ];
      }
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId, selectedUnit, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId, selectedUnit);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.productId === productId && item.selectedUnit === selectedUnit) {
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId, selectedUnit) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => !(item.productId === productId && item.selectedUnit === selectedUnit))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const saveAddress = (addressObj) => {
    setDeliveryAddress(addressObj);
  };

  // Calculations
  const subtotal = Math.round(
    cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
  );

  const freeThreshold = 500;
  const tier1Threshold = 199;

  let deliveryFee = 30;
  if (subtotal >= freeThreshold) {
    deliveryFee = 0;
  } else if (subtotal >= tier1Threshold) {
    deliveryFee = 20;
  }

  const amountNeededForFreeDelivery = Math.max(0, freeThreshold - subtotal);
  const grandTotal = Math.max(0, subtotal + deliveryFee);
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        deliveryAddress,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        saveAddress,
        subtotal,
        deliveryFee,
        freeThreshold,
        amountNeededForFreeDelivery,
        grandTotal,
        totalItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
