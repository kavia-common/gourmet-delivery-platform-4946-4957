import React, { useEffect, useState } from 'react';
import RestaurantCard from '../components/RestaurantCard';
import { Api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { token } = useAuth();
  const [restaurants, setRestaurants] = useState(null);

  useEffect(() => {
    let mounted = true;
    Api.listRestaurants(token).then(data => { if (mounted) setRestaurants(data); });
    return () => { mounted = false; };
  }, [token]);

  return (
    <div>
      <section className="hero">
        <div className="hero-inner">
          <span className="badge">Ocean Professional</span>
          <h1 className="m-0 mt-2" style={{ fontSize: 28, fontWeight: 900 }}>Discover gourmet near you</h1>
          <p className="text-muted m-0 mt-2">Browse top-rated restaurants and order with confidence.</p>
        </div>
      </section>
      <div className="container page">
        <div className="header">
          <h2 className="title">Popular Restaurants</h2>
        </div>
        {(!restaurants || restaurants.length === 0) ? (
          <div className="list-empty">No restaurants available yet.</div>
        ) : (
          <div className="grid grid-3">
            {restaurants.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
          </div>
        )}
      </div>
    </div>
  );
}
