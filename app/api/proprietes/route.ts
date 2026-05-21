import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import path from "path";

export const dynamic = "force-dynamic";

function convertirTypeVoie(type: string) {
  const map: Record<string, string> = {
    RU: "rue",
    AV: "avenue",
    BO: "boulevard",
    CH: "chemin",
    PL: "place",
    CR: "croissant",
    IM: "impasse",
    RG: "rang",
  };

  return map[String(type).trim()] || "";
}

async function geocode(address: string) {
  const url =
    `https://nominatim.openstreetmap.org/search?` +
    `q=${encodeURIComponent(address)}` +
    `&format=json&limit=1`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "TrouveUnPlex/1.0",
    },
  });

  const data = await res.json();

  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  return {
    lat: Number(data[0].lat),
    lng: Number(data[0].lon),
  };
}

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "data",
      "ancienne_lorette.xlsx"
    );

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    const proprietes = [];

    for (const row of rows.slice(0, 50)) {
      const no = row["No civique"];
      const typeVoie = convertirTypeVoie(row["Type voie"]);
      const rue = row["Nom rue"];

      if (!no || !rue) continue;

      const adresse = `${no} ${typeVoie} ${rue}, L'Ancienne-Lorette, Québec, Canada`;

      const coords = await geocode(adresse);

      if (!coords) {
        console.log("Adresse non trouvée:", adresse);
        continue;
      }

      proprietes.push({
        adresse,
        typeLogement: row["RL0311A"],
        evaluation: row["RL0404A"],
        hypotheque: null,
        dateDernierProprio: row["RL0201Gx"],
        anneeConstruction: row["RL0307A"],
        lat: coords.lat,
        lng: coords.lng,
      });

      await new Promise((resolve) => setTimeout(resolve, 1100));
    }

    return NextResponse.json({
      totalExcel: rows.length,
      totalAvecCoordonnees: proprietes.length,
      proprietes,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erreur dans /api/proprietes",
        detail: String(error),
      },
      { status: 500 }
    );
  }
}
