const BASE_URL = 'http://localhost:3001';

function buildHeaders(token) {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// PUBLIC_INTERFACE
export async function apiGet(path, token) {
  /** Fetch JSON via GET; returns { data, error } */
  try {
    const res = await fetch(`${BASE_URL}${path}`, { headers: buildHeaders(token) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { data: null, error: data?.message || res.statusText };
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e.message || 'Network error' };
  }
}

// PUBLIC_INTERFACE
export async function apiPost(path, body, token) {
  /** POST JSON; returns { data, error } */
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: buildHeaders(token),
      body: JSON.stringify(body || {})
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { data: null, error: data?.message || res.statusText };
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e.message || 'Network error' };
  }
}

// PUBLIC_INTERFACE
export const Api = {
  /** High-level API helpers; use mocked fallbacks if backend is not ready. */
  async listRestaurants(token) {
    const { data, error } = await apiGet('/restaurants', token);
    if (error || !Array.isArray(data)) {
      return [
        { id: 'r1', name: 'Oceanic Sushi', cuisine: 'Japanese', rating: 4.7, eta: '25-35', image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1200&auto=format&fit=crop' },
        { id: 'r2', name: 'Blue Harbor Grill', cuisine: 'Seafood', rating: 4.5, eta: '30-40', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop' },
        { id: 'r3', name: 'Amber Spice Kitchen', cuisine: 'Indian', rating: 4.6, eta: '20-30', image: 'https://images.unsplash.com/photo-1544025162-8b5f0f5578d2?q=80&w=1200&auto=format&fit=crop' }
      ];
    }
    return data;
  },
  async getRestaurant(id, token) {
    const { data, error } = await apiGet(`/restaurants/${id}`, token);
    if (error || !data) {
      return {
        id, name: 'Demo Restaurant', cuisine: 'Fusion', rating: 4.6, eta: '20-30',
        image: 'https://images.unsplash.com/photo-1604908554027-8cd0f1a3a95b?q=80&w=1200&auto=format&fit=crop',
        menu: [
          { id: 'm1', name: 'Seared Tuna Bowl', price: 16.5, description: 'Sesame crust, avocado, sushi rice' },
          { id: 'm2', name: 'Miso Glazed Salmon', price: 19.0, description: 'Citrus, brown rice, greens' },
          { id: 'm3', name: 'Amber Curry', price: 14.0, description: 'Roasted vegetables, jasmine rice' }
        ]
      };
    }
    return data;
  },
  async login({ email, password }) {
    const { data, error } = await apiPost('/auth/login', { email, password });
    if (error || !data?.token) {
      // Mock token
      return { token: 'demo-token', user: { email } };
    }
    return data;
  },
  async createOrder(order, token) {
    const { data, error } = await apiPost('/orders', order, token);
    if (error) {
      // Mock success
      return { orderId: `demo-${Date.now()}`, status: 'received', etaMinutes: 30 };
    }
    return data;
  }
};
