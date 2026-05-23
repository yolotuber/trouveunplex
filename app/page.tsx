"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

type Propriete = {
  adresse: string;
  lat: number;
  lng: number;
};

export default function Home() {
  const [proprietes, setProprietes] =
    useState<Propriete[]>([]);

  useEffect(() => {
    fetch("/api/proprietes")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setProprietes(data);
      });
  }, []);

  return (
    <main style={{ height: "100vh" }}>
      <MapContainer
        center={[46.79, -71.38]}
        zoom={13}
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {proprietes.map((p, i) => (
          <Marker
            key={i}
            position={[p.lat, p.lng]}
          >
            <Popup>
              {p.adresse}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </main>
  );
}
