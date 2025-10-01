
import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const LocationPicker = ({ onPick, pinOnly, lat, lng }) => {
  const [position, setPosition] = React.useState(lat && lng ? { lat, lng } : null);

  useMapEvents({
    click(e) {
      if (!pinOnly) {
        setPosition(e.latlng);
        if (onPick) onPick(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  // If pinOnly and lat/lng provided, always show that pin
  if (pinOnly && lat && lng) {
    return <Marker position={[lat, lng]} />;
  }
  return position ? <Marker position={position} /> : null;
};

const MapPicker = ({ onPick, pinOnly = false, lat, lng }) => {
  const mapRef = useRef();
  const center = lat && lng ? [lat, lng] : [6.9271, 79.8612];

  useEffect(() => {
    if (mapRef.current && lat && lng) {
      mapRef.current.setView([lat, lng], 15, { animate: true });
    }
  }, [lat, lng]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MapContainer
        center={center}
        zoom={lat && lng ? 15 : 13}
        style={{ width: '100%', height: '100%' }}
        whenCreated={mapInstance => { mapRef.current = mapInstance; }}
        scrollWheelZoom={true}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationPicker onPick={onPick} pinOnly={pinOnly} lat={lat} lng={lng} />
      </MapContainer>
    </div>
  );
};

export default MapPicker;
