import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import AppRoutes from './routes';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// PUBLIC_INTERFACE
function App() {
  /** Root application: wraps providers and renders routed pages */
  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />
        <main>
          <AppRoutes />
        </main>
        <CartSidebar />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
