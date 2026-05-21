import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import path from "path";

async function geocode(address: string) {
  try {
    const url =
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(address)}` +
      `&format=json&limit=1`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "TrouveUnPlex"
      }
    });

    const data = await res.json();

    if (data.length === 0) return null;

    return {
      lat: Number(data[0].lat),
      lng: Number(data[0].lon),
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const filePath = path.join(
    process.cwd(),
    "data",
    "ancienne_lorette.xlsx"
  );

  const workbook = XLSX.readFile(filePath);
  const sheet =
    workbook.Sheets[workbook.SheetNames[0]];

  const rows: any[] =
    XLSX.utils.sheet_to_json(sheet);

  const proprietes = [];

  for (const row of rows.slice(0, 300)) {
    const adresse = `${row["No civique"]} ${row["Type voie"]} ${row["Nom rue"]}, L'Ancienne-Lorette, QC`;

    const coords = await geocode(adresse);

    if (!coords) continue;

    proprietes.push({
      adresse,
      typeLogement: row["RL0311A"],
      evaluation: row["RL0404A"],
      hypothèque: null,
      dateDernierProprio: row["RL0201Gx"],
      anneeConstruction: row["RL0307A"],
      lat: coords.lat,
      lng: coords.lng,
    });
  }

  return NextResponse.json(proprietes);
}
