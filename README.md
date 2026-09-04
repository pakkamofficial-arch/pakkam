# PAKKAM — Your Nearby Everything 🥬🛒🚚

Hyperlocal Indian Grocery & Vegetable E-Commerce Application connecting customers with nearby local shops for fast 1–2 hour doorstep delivery.

---

## 🌟 Application Features

- **Hyperlocal Location & Persistent Delivery Setup**: Asks delivery address once during onboarding and persists across app launches.
- **Product & Vegetable Catalog**: Includes 35+ seeded products with stock status, fractional weights (250g, 500g, 1kg, 2kg, 5kg), Tamil names, MRP discounts, and related products recommendations.
- **Dynamic Cart & Delivery Fee Rules**: Minimum order threshold validation (₹199) and dynamic delivery tier calculation (under ₹299 -> ₹30, ₹299-₹499 -> ₹20, ₹500+ -> FREE).
- **Online & COD Checkout**: Real order creation saved directly to MongoDB.
- **Green Confirmation Screen**: Visual green tick `✓`, order number `#PKMXXXXX`, delivery estimate, and live order tracking link.
- **Order Tracking & Driver Privacy**: Real-time status timeline (`PLACED` -> `ACCEPTED` -> `PREPARING` -> `READY_FOR_PICKUP` -> `OUT_FOR_DELIVERY` -> `DELIVERED`) without exposing delivery partner phone numbers.
- **Monthly Grocery List**: Starter family templates (Family of 2, 4, 6 or Custom), item quantity controls, list duplication (e.g. Sept -> Oct), and "Add All to Cart" availability checks.
- **Profile & Live Edit**: Full profile management with instant MongoDB update and Redux sync.
- **Order History & Cancellation**: View active/previous orders, cancel eligible orders (`PLACED`, `ACCEPTED`, `PREPARING`) with confirmation alerts, and instant reorder at current prices.
- **Seller & Delivery Portals**: Order management, item status updates, and stock controls.
- **Admin Control Panel**: Dynamic delivery fee settings, shop management, and coupon management.

---

## 📁 Repository Structure

```
Pakkam App/
├── backend/            # Express, MongoDB, Mongoose REST API (TypeScript)
│   ├── src/controllers
│   ├── src/models
│   ├── src/routes
│   └── src/scripts/seed.ts
├── mobile/             # React Native, Expo, Redux Toolkit Customer App
│   ├── App.tsx
│   ├── src/screens
│   ├── src/redux
│   └── src/navigation
└── admin/              # React, Vite, React Router Web Admin Panel
    ├── src/pages
    └── src/services
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Running locally at `mongodb://127.0.0.1:27017/pakkam_db`

---

### 1. Backend Setup & Database Seeding

```bash
cd backend
npm install

# Seed the database with products, shops, categories, & demo users
npm run seed

# Start development server on port 5000
npm run dev
```

---

### 2. Mobile App Setup (Expo / React Native)

```bash
cd mobile
npm install

# Start Expo dev server
npm start
```

---

### 3. Admin Panel Setup (Vite / React)

```bash
cd admin
npm install

# Start Vite dev server on port 5173
npm run dev
```

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@pakkam.test` | `Password123!` | Mobile Customer App |
| **Seller** | `seller@pakkam.test` | `Password123!` | Mobile Seller Dashboard |
| **Delivery** | `delivery@pakkam.test` | `Password123!` | Mobile Delivery Portal |
| **Admin** | Configured in backend `.env` (`ADMIN_EMAIL`) | Configured in backend `.env` (`ADMIN_PASSWORD`) | Admin Web Panel |

---

## 🧪 Manual Verification Matrix

1. **Auth & Setup**: Register/Login -> set address -> restart app -> verify location is remembered.
2. **Profile Edit**: Profile -> Edit Profile -> change name -> save -> verify instant update.
3. **Vegetable Selection**: Open Tomato -> select 2kg -> verify stock availability & MRP savings.
4. **Minimum Order**: Add ₹50 item -> open cart -> verify minimum order warning (`₹199 needed`) and disabled checkout.
5. **Checkout & COD**: Add items > ₹199 -> Checkout -> select COD -> Place Order -> verify **Green Tick Confirmation Screen**.
6. **Order Cancellation**: Go to My Orders -> click Cancel on active order -> confirm -> verify status changes to `CANCELLED`.
7. **Monthly Grocery**: Monthly List -> choose "Family of 4" -> click "Add All to Cart" -> verify items added to cart.
