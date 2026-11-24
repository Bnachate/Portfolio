import { ImageResponse } from "next/og";

// Browser tab icon: "BN" monogram in the site's cyan, generated at build time
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0891b2",
          borderRadius: 14,
          color: "#ffffff",
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
