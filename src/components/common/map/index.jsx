// "use client";
// import { useEffect, useState } from "react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import {
//   GoogleMap,
//   LoadScript,
//   Marker as GoogleMarker,
// } from "@react-google-maps/api";
// import "leaflet/dist/leaflet.css";

// const Map = ({
//   provider = "leaflet",
//   apiKey,
//   position = { lat: 51.505, lng: -0.09 },
//   zoom = 13,
// }) => {
//   const [isGoogleReady, setIsGoogleReady] = useState(false);

//   useEffect(() => {
//     if (provider === "google" && apiKey) {
//       setIsGoogleReady(true);
//     }
//   }, [provider, apiKey]);

//   if (provider === "google" && apiKey) {
//     return (
//       <LoadScript googleMapsApiKey={apiKey}>
//         <GoogleMap
//           mapContainerStyle={{ width: "100%", height: "400px" }}
//           center={position}
//           zoom={zoom}
//         >
//           <GoogleMarker position={position} />
//         </GoogleMap>
//       </LoadScript>
//     );
//   }

//   return (
//     <MapContainer
//       center={[position.lat, position.lng]}
//       zoom={zoom}
//       style={{ height: "400px", width: "100%" }}
//     >
//       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//       <Marker position={[position.lat, position.lng]}>
//         <Popup>A sample location!</Popup>
//       </Marker>
//     </MapContainer>
//   );
// };

// export default Map;
