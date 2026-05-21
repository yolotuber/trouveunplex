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
  typeLogement: string;
  evaluation: number;
  dateDernierProprio: string;
  anneeConstruction: number;
  lat: number;
  lng: number;
};

export default function MapClient() {
  const [data, setData] = useState<Propriete[]>([]);

  useEffect(() => {
    fetch("/api/proprietes")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <MapContainer
      center={[46.793, -71.351]}
      zoom={13}
      style={{
        height: "100vh",
        width: "100%",
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {data.map((p, i) => (
        <Marker
          key={i}
          position={[p.lat, p.lng]}
        >
          <Popup>
            <strong>{p.adresse}</strong>

            <br />
            Type : {p.typeLogement}

            <br />
            Évaluation :
            {" "}
            {p.evaluation?.toLocaleString(
              "fr-CA"
            )}
            $

            <br />
            Année :
            {" "}
            {p.anneeConstruction}

            <br />
            Dernier proprio :
            {" "}
            {String(
              p.dateDernierProprio
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
