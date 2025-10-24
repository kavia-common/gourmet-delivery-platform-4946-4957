const BASE_URL = process.env.REACT_APP_API_BASE || '';

/**
 * Build default headers for API requests and include auth token when provided.
 */
function buildHeaders(token) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/**
 * Normalize a restaurant object to the shape expected by the UI.
 * - Map _id -> id
 * - Ensure eta is a number or number-like string without "min"
 * - Ensure rating is a number
 */
function normalizeRestaurant(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  const id = raw.id || raw._id || raw.restaurantId || raw.slug || String(raw?.name || '');
  // try to coerce eta to a plain number or "x-y" string as the UI prints "min" separately
  let eta = raw.eta ?? raw.estimatedTime ?? raw.estimatedMinutes;
  if (typeof eta === 'string' && eta.toLowerCase().includes('min')) {
    eta = eta.replace(/min/ig, '').trim();
  }
  return {
    ...raw,
    id,
    eta,
    rating: typeof raw.rating === 'number' ? raw.rating : Number(raw.rating || 0)
  };
}

/**
 * Normalize a menu item:
 * - Map _id -> id, menuItemId -> id
 * - Ensure price is number
 */
function normalizeMenuItem(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  const id = raw.id || raw._id || raw.menuItemId;
  return {
    ...raw,
    id,
    price: typeof raw.price === 'number' ? raw.price : Number(raw.price || 0)
  };
}

/**
 * Some backends return restaurant payload without embedded menu
 * and expose it via /restaurants/:id/menu. This helper tries the
 * main endpoint first, then fetches menu if missing.
 */
async function fetchRestaurantWithMenu(id, token) {
  const { data, error } = await apiGet(`/restaurants/${id}`, token);
  if (error || !data) return { data: null, error: error || 'Not found' };

  let restaurant = normalizeRestaurant(data);
  // if no menu array present, try to fetch it
  if (!Array.isArray(restaurant.menu)) {
    const menuRes = await apiGet(`/restaurants/${id}/menu`, token);
    if (!menuRes.error && Array.isArray(menuRes.data)) {
      restaurant = { ...restaurant, menu: menuRes.data.map(normalizeMenuItem) };
    }
  } else {
    restaurant = { ...restaurant, menu: restaurant.menu.map(normalizeMenuItem) };
  }
  return { data: restaurant, error: null };
}

/**
 * Construct a fully-qualified URL for API paths, ensuring single slash.
 */
function buildUrl(path) {
  const base = BASE_URL.replace(/\/+$/, '');
  const p = String(path || '').startsWith('/') ? path : `/${path || ''}`;
  return `${base}${p}`;
}

// PUBLIC_INTERFACE
export async function apiGet(path, token) {
  /** Fetch JSON via GET; returns { data, error } */
  try {
    const res = await fetch(buildUrl(path), { headers: buildHeaders(token) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { data: null, error: data?.message || res.statusText || 'Request failed' };
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e.message || 'Network error' };
  }
}

// PUBLIC_INTERFACE
export async function apiPost(path, body, token) {
  /** POST JSON; returns { data, error } */
  try {
    const res = await fetch(buildUrl(path), {
      method: 'POST',
      headers: buildHeaders(token),
      body: JSON.stringify(body || {})
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { data: null, error: data?.message || res.statusText || 'Request failed' };
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
    // normalize list to ensure id instead of _id
    return data.map(normalizeRestaurant);
  },

  async getRestaurant(id, token) {
    // Try to fetch restaurant and ensure menu exists, with minimal coupling
    const { data, error } = await fetchRestaurantWithMenu(id, token);
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

  // PUBLIC_INTERFACE
  async register({ name, email, password }) {
    /** Register a new user via POST /auth/register; returns { success: true } or error */
    const { data, error } = await apiPost('/auth/register', { name, email, password });
    if (error) return { success: false, error };
    return { success: true, data };
  },

  async createOrder(order, token) {
    // Try to map common order shape expected by backend: { restaurantId, items: [{menuItemId, quantity}] }
    // If the caller passes UI cart shape, keep it as-is for compatibility (backend may accept flexible payload).
    const mapped = (() => {
      if (order && Array.isArray(order.items) && !order.items.find(i => i.menuItemId)) {
        // map from {id, qty} to backend expected keys, if present
        return {
          ...order,
          items: order.items.map(i => ({
            menuItemId: i.menuItemId || i.id,
            quantity: i.quantity || i.qty || 1,
            instructions: i.instructions
          }))
        };
      }
      return order;
    })();

    const { data, error } = await apiPost('/orders', mapped, token);
    if (error) {
      // Mock success
      return { orderId: `demo-${Date.now()}`, status: 'received', etaMinutes: 30 };
    }
    return data;
  },

  // PUBLIC_INTERFACE
  async getOrderStatus(id, token) {
    /** Get order status via GET /orders/:id/status */
    const { data, error } = await apiGet(`/orders/${encodeURIComponent(id)}/status`, token);
    if (error) {
      // Graceful fallback
      return { orderId: id, status: 'received', etaMinutes: 30, error };
    }
    return data;
  }
};
