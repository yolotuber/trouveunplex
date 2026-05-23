"use client";

import { useEffect, useState } from "react";
import type { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icons (broken with webpack)
import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Propriete = {
  adresse: string;
  typeLogement: string;
  evaluation: number | null;
  dateDernierProprio: string | null;
  anneeConstruction: number | null;
  lat: number;
  lng: number;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: "6px", marginBottom: "4px" }}>
      <span style={{ fontWeight: 600, color: "#555", minWidth: "130px" }}>
        {label}
      </span>
      <span style={{ color: "#111" }}>{value}</span>
    </div>
  );
}

export default function MapClient() {
  const [data, setData] = useState<Propriete[]>([]);
  const [loading, setLoading] = useState(true);

  const center: LatLngExpression = [46.793, -71.351];

  useEffect(() => {
    fetch("/api/proprietes")
      .then((res) => res.json())
      .then((json) => {
        setData(json.proprietes || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement données:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      {loading && (
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            background: "white",
            padding: "8px 16px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            fontSize: "14px",
            color: "#333",
          }}
        >
          Chargement des propriétés…
        </div>
      )}

      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {data.map((p, index) => (
          <Marker key={index} position={[p.lat, p.lng]}>
            <Popup minWidth={260}>
              <div style={{ fontFamily: "sans-serif", fontSize: "13px", lineHeight: "1.5" }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "14px",
                    marginBottom: "8px",
                    color: "#1a1a2e",
                    borderBottom: "1px solid #eee",
                    paddingBottom: "6px",
                  }}
                >
                  {p.adresse}
                </div>

                <InfoRow
                  label="Type de logement"
                  value={p.typeLogement || "—"}
                />
                <InfoRow
                  label="Évaluation"
                  value={
                    p.evaluation != null
                      ? `${p.evaluation.toLocaleString("fr-CA")} $`
                      : "—"
                  }
                />
                <InfoRow
                  label="Année construction"
                  value={p.anneeConstruction != null ? String(p.anneeConstruction) : "—"}
                />
                <InfoRow
                  label="Dernier proprio"
                  value={p.dateDernierProprio ? String(p.dateDernierProprio).slice(0, 10) : "—"}
                />
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
