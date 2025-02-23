"use client"; // Ensures it runs only in the client

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import {
  GoogleMap,
  LoadScript,
  Marker as GoogleMarker,
} from "@react-google-maps/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for missing marker icons in Leaflet
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const Map = ({
  provider = "leaflet",
  apiKey,
  position = { lat: 0, lon: 0 },
  zoom = 13,
  width = "100%",
  height = "400px",
}) => {
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [clientPosition, setClientPosition] = useState(position);

  useEffect(() => {
    if (typeof window !== "undefined" && provider === "google" && apiKey) {
      setIsGoogleReady(true);
    }

    if (typeof window !== "undefined" && "navigator" in window) {
      !position &&
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setClientPosition({
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
            });
          },
          (err) => console.error(err)
        );
      position &&
        setClientPosition({
          lat: position.lat,
          lon: position.lon,
        });
    }
  }, [provider, apiKey, position]);

  if (provider === "google" && apiKey && isGoogleReady) {
    return (
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={{ width: width, height: height }}
          center={clientPosition}
          zoom={zoom}
        >
          <GoogleMarker position={clientPosition} />
        </GoogleMap>
      </LoadScript>
    );
  }

  return (
    <MapContainer
      center={[clientPosition.lat, clientPosition.lon]}
      zoom={zoom}
      style={{ height: height, width: width }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker
        position={[clientPosition.lat, clientPosition.lon]}
        icon={customIcon}
      >
        <Popup>A sample location!</Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;
