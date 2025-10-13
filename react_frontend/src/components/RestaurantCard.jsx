import React from 'react';
import { Link } from 'react-router-dom';

export default function RestaurantCard({ restaurant }) {
  const { id, name, cuisine, rating, eta, image } = restaurant;
  return (
    <article className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
        <img src={image} alt={`${name} cover`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div className="badge" style={{ position: 'absolute', top: 12, left: 12, backdropFilter: 'blur(2px)' }}>
          {eta} min
        </div>
      </div>
      <div style={{ padding: 14 }}>
        <h3 className="m-0" style={{ fontSize: 18 }}>{name}</h3>
        <p className="text-muted m-0">{cuisine} • ⭐ {rating?.toFixed ? rating.toFixed(1) : rating}</p>
        <div className="mt-4">
          <Link to={`/restaurant/${id}`} className="btn outline" aria-label={`View ${name}`}>View menu</Link>
        </div>
      </div>
    </article>
  );
}
