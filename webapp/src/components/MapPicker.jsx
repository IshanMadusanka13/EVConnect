import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const LocationPicker = ({ onPick }) => {
  const [position, setPosition] = React.useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      if (onPick) onPick(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const MapPicker = ({ onPick }) => (
  <div style={{ width: '100%', height: '300px' }}>
    <MapContainer center={[6.9271, 79.8612]} zoom={13} style={{ width: '100%', height: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationPicker onPick={onPick} />
    </MapContainer>
  </div>
);

export default MapPicker;
