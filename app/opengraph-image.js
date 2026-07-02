import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Social share card — generated at build time. Mirrors the landing hero:
// Geist Black name on #050505, cream text, green availability dot.

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Yinka Kolawole — Full-Stack Developer";

const FONT_DIR = join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans");

export default async function OpengraphImage() {
  const [geistBlack, geistRegular] = await Promise.all([
    readFile(join(FONT_DIR, "Geist-Black.ttf")),
    readFile(join(FONT_DIR, "Geist-Regular.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#050505",
          color: "#f5f2ea",
          padding: "64px 72px",
          fontFamily: "Geist",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 22,
            letterSpacing: 4,
            color: "#9a9a9a",
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#00c853",
            }}
          />
          AVAILABLE FOR WORK
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 148,
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: -4,
            }}
          >
            YINKA
          </div>
          <div
            style={{
              fontSize: 148,
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: -4,
            }}
          >
            KOLAWOLE
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 26,
            color: "#9a9a9a",
            letterSpacing: 2,
          }}
        >
          <div style={{ display: "flex" }}>
            FULL-STACK DEVELOPER — INTERFACES, APIS &amp; DATABASES
          </div>
          <div style={{ display: "flex", color: "#f5f2ea", fontWeight: 900 }}>
            YINKA.KLW
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: geistRegular, weight: 400, style: "normal" },
        { name: "Geist", data: geistBlack, weight: 900, style: "normal" },
      ],
    }
  );
}
