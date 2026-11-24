import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { SITE } from "./config/site";

// Preview image shown when the site link is shared (LinkedIn, Slack, WhatsApp...).
// Generated once at build time from the profile photo and the site identity.
export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background: "linear-gradient(135deg, #ecfeff 0%, #ffffff 55%, #f0fdfa 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div style={{ fontSize: 30, color: "#0891b2", fontWeight: 600, marginBottom: 16 }}>Portfolio</div>
          <div style={{ fontSize: 76, color: "#111827", fontWeight: 700, lineHeight: 1.05 }}>{SITE.name}</div>
          <div style={{ fontSize: 44, color: "#374151", marginTop: 18 }}>{SITE.jobTitle}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 36 }}>
            {SITE.skills.map((skill) => (
              <div
                key={skill}
                style={{
                  fontSize: 24,
                  color: "#155e75",
                  background: "#cffafe",
                  borderRadius: 999,
                  padding: "8px 20px",
                }}
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
          height={340}
          style={{ borderRadius: 999, objectFit: "cover", border: "10px solid #ffffff", boxShadow: "0 20px 50px rgba(8, 145, 178, 0.25)" }}
        />
      </div>
    ),
    size,
  );
}
