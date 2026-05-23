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
      headers: { "User-Agent": "TrouveUnPlex" },
    });

    const data = await res.json();
    if (!data.length) return null;

    return {
      lat: Number(data[0].lat),
      lng: Number(data[0].lon),
    };
  } catch {
    return null;
  }
}

const typeVoie: Record<string, string> = {
  RU: "rue",
  AV: "avenue",
  BO: "boulevard",
  CH: "chemin",
  PL: "place",
  CR: "croissant",
  IM: "impasse",
  RG: "rang",
  RO: "route",
};

const typeLogement: Record<number, string> = {
  1: "Maison unifamiliale",
  2: "Duplex",
  3: "Triplex",
  4: "Quadruplex",
  5: "Quintuplex",
  6: "Immeuble 6+ logements",
};

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
      const numero = Math.trunc(Number(row["No civique"]));
      const rue = row["Nom rue"] || "";
      const typeCode = row["Type voie"] || "";
      const typeComplet = typeVoie[typeCode] || typeCode;

      const adresse =
        `${numero} ${typeComplet} ${rue}, ` +
        `L'Ancienne-Lorette, Québec, Canada`;

      const coords = await geocode(adresse);
      if (!coords) continue;

      const typeLogCode = Number(row["RL0311A"]);

      proprietes.push({
        adresse,
        lat: coords.lat,
        lng: coords.lng,
        typeLogement: typeLogement[typeLogCode] || `Type ${typeLogCode}`,
        evaluation: row["RL0404A"] ? Number(row["RL0404A"]) : null,
        anneeConstruction: row["RL0307A"] ? Number(row["RL0307A"]) : null,
        dateDernierProprio: row["RL0201Gx"] || null,
      });

      await new Promise((r) => setTimeout(r, 1000));
    }

    return NextResponse.json({ proprietes });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur API" }, { status: 500 });
  }
}
