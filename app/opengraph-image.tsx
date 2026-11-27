import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { SITE } from "./config/site";

// Preview image shown when the site link is shared (LinkedIn, Slack, WhatsApp...), in the
// "Encre et menthe" colors of the site. Generated once at build time from the profile photo.
export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0F1B2D";
const MINT_LIGHT = "#3DD6A8";
const ON_INK = "#F5F7FA";
const LINE = "#CBD4E0";
const INK_RULE = "#2B3B54";

export default async function OpenGraphImage() {
  const photo = await readFile(path.join(process.cwd(), "public", "my_photo.jpeg"));
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 90px",
          background: INK,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 660 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 64,
                height: 64,
                borderRadius: 14,
                background: MINT_LIGHT,
                color: INK,
                fontSize: 30,
                fontWeight: 700,
              }}
            >
              BN
            </div>
            <div style={{ fontSize: 30, color: LINE, fontWeight: 600 }}>Portfolio</div>
          </div>
          <div style={{ fontSize: 80, color: ON_INK, fontWeight: 700, lineHeight: 1.02, marginTop: 34, letterSpacing: -2 }}>{SITE.name}</div>
          <div style={{ fontSize: 42, color: MINT_LIGHT, fontWeight: 600, marginTop: 16 }}>{SITE.jobTitle}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 40 }}>
            {SITE.skills.map((skill) => (
              <div
                key={skill}
                style={{ fontSize: 24, color: LINE, border: `2px solid ${INK_RULE}`, borderRadius: 8, padding: "8px 18px" }}
              >
                {skill}
              </div>
            ))}
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse only supports plain <img> */}
        <img
          src={photoSrc}
          alt=""
          width={340}
          height={425}
          style={{ borderRadius: 24, objectFit: "cover", border: `2px solid ${INK_RULE}` }}
        />
      </div>
    ),
    size,
  );
}
