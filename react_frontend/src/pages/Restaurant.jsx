import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import MenuItemCard from '../components/MenuItemCard';

export default function Restaurant() {
  const { id } = useParams();
  const { token } = useAuth();
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    let mounted = true;
    Api.getRestaurant(id, token).then(data => { if (mounted) setRestaurant(data); });
    return () => { mounted = false; };
  }, [id, token]);

  if (!restaurant) {
    return <div className="container page"><div className="list-empty">Loading menu...</div></div>;
  }

  return (
    <div className="container page">
      <div className="header">
        <div>
          <h2 className="title">{restaurant.name}</h2>
          <p className="text-muted m-0">{restaurant.cuisine} • ⭐ {restaurant.rating} • {restaurant.eta} min</p>
        </div>
      </div>
      {restaurant.image ? (
        <div className="card" style={{ marginBottom: 16 }}>
          <img src={restaurant.image} alt={`${restaurant.name} banner`} />
        </div>
      ) : null}
      <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
        {restaurant.menu?.map(m => <MenuItemCard key={m.id} item={m} />)}
      </div>
    </div>
  );
}
