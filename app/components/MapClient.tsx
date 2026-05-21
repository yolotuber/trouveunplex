"use client";

import { useEffect, useState } from "react";
import type { LatLngExpression } from "leaflet";
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

  const center: LatLngExpression = [
    46.793,
    -71.351,
  ];

  useEffect(() => {
    fetch("/api/proprietes")
      .then((res) => res.json())
      .then((json) => setData(json.proprietes || []))
      .catch((err) =>
        console.error(
          "Erreur chargement données:",
          err
        )
      );
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
      }}
    >
      <MapContainer
        center={center}
        zoom={13}
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {data.map((p, index) => (
          <Marker
            key={index}
            position={[p.lat, p.lng]}
          >
            <Popup>
              <div>
                <strong>
                  {p.adresse}
                </strong>

                <br />
                <strong>Type :</strong>{" "}
                {p.typeLogement}

                <br />
                <strong>
                  Évaluation :
                </strong>{" "}
                {p.evaluation?.toLocaleString(
                  "fr-CA"
                )}{" "}
                $

                <br />
                <strong>
                  Année construction :
                </strong>{" "}
                {p.anneeConstruction}

                <br />
                <strong>
                  Dernier proprio :
                </strong>{" "}
                {String(
                  p.dateDernierProprio
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
