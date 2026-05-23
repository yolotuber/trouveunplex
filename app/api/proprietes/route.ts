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

    if (!data.length) return null;

    return {
      lat: Number(data[0].lat),
      lng: Number(data[0].lon),
    };
  } catch (error) {
    console.log("Erreur geocode:", error);
    return null;
  }
}

export async function GET() {
  try {
    // Excel dans /data/ancienne_lorette.xlsx
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

    for (const row of rows.slice(0, 50)) {
      const numero = Math.trunc(
        Number(row["No civique"])
      );

      const rue =
        row["Nom voie circulation"] || "";

      const type =
        row["Type voie circulation"] || "";

      // Traduction simple
      const types: Record<string, string> = {
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

      const typeComplet =
        types[type] || type;

      const adresse =
        `${numero} ${typeComplet} ${rue}, ` +
        `L'Ancienne-Lorette, Québec, Canada`;

      console.log(adresse);

      const coords =
        await geocode(adresse);

      if (!coords) continue;

      proprietes.push({
        adresse,
        lat: coords.lat,
        lng: coords.lng,
      });

      // éviter blocage API
      await new Promise((r) =>
        setTimeout(r, 1000)
      );
    }

    console.log(
      "Nb propriétés:",
      proprietes.length
    );

    return NextResponse.json(
      proprietes
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erreur API" },
      { status: 500 }
    );
  }
}
