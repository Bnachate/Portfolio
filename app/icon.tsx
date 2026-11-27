import { ImageResponse } from "next/og";

// Browser tab icon: the "BN" monogram of the site header (mint on ink), generated at build time
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#3DD6A8",
          borderRadius: 14,
          color: "#0F1B2D",
          fontSize: 34,
          fontWeight: 700,
          fontFamily: "sans-serif",
          letterSpacing: -1,
        }}
      >
        BN
      </div>
    ),
    size,
  );
}
