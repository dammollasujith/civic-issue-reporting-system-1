import { useEffect, useState, memo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ensureLeafletIcons } from "@/components/maps/leafletFix";

type LocationPickerMapProps = {
  initialCenter: [number, number];
  zoom?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  position?: [number, number] | null;
};

function LocationMarker({ position, onLocationSelect }: { position: [number, number] | null; onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

function MapController({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 1.5 });
    }
  }, [position, map]);
  return null;
}

const LocationPickerMap = memo(({ initialCenter, zoom = 13, onLocationSelect, position: externalPosition }: LocationPickerMapProps) => {
  useEffect(() => {
    ensureLeafletIcons();
  }, []);

  const [internalPosition, setInternalPosition] = useState<[number, number] | null>(null);

  // Sync internal position with external if provided
  useEffect(() => {
    if (externalPosition) {
      setInternalPosition(externalPosition);
    }
  }, [externalPosition]);

  return (
    <div className="relative isolate overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-950/40">
      <MapContainer
        center={initialCenter}
        zoom={zoom}
        style={{ height: 350, width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController position={internalPosition} />
        <LocationMarker position={internalPosition} onLocationSelect={(lat, lng) => {
          setInternalPosition([lat, lng]);
          onLocationSelect(lat, lng);
        }} />
      </MapContainer>
    </div>
  );
});

export default LocationPickerMap;

