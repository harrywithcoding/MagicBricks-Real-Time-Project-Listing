'use client';

import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Dynamically import react-leaflet parts
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

export default function MapView({ projects = [], cityName }) {
  useEffect(() => {
    // Fix leaflet marker icons (only run in browser)
    (async () => {
      const L = await import('leaflet');
      delete (L.Icon.Default.prototype)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    })();
  }, []);

  // Find first project with valid coords
  const firstCoord = projects.find(
    (p) => p.latitude && p.longitude
  );

  const center = firstCoord
    ? [firstCoord.latitude, firstCoord.longitude]
    : [20.5937, 78.9629]; // fallback: India center

  return (
    <MapContainer
      center={center}
      zoom={firstCoord ? 12 : 5}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {projects
        .filter((p) => p.latitude && p.longitude)
        .map((p, i) => (
          <Marker key={i} position={[p.latitude, p.longitude]}>
            <Popup>
              <div style={{ minWidth: 200 }}>
                <strong>{p.name}</strong>
                <div>{p.location}</div>
                <div>Price: {p.priceRange}</div>
                <div>Builder: {p.builder}</div>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
