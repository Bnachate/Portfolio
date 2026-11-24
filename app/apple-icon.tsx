import { ImageResponse } from "next/og";

// Home-screen icon for iOS (when the site is added to the home screen)
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          color: "#ffffff",
          fontSize: 92,
          fontWeight: 700,
          fontFamily: "sans-serif",
          letterSpacing: -3,
        }}
      >
        BN
      </div>
    ),
    size,
  );
}
