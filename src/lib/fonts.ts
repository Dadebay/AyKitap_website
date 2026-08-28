import localFont from "next/font/local";

// Drop additional weights into src/fonts/ and uncomment the matching
// entries below (exact filenames): Gilroy-Medium.ttf (500),
// Gilroy-SemiBold.ttf (600), Gilroy-Bold.ttf (700), Gilroy-ExtraBold.ttf (800).
export const gilroy = localFont({
  src: [
    { path: "../fonts/Gilroy-Regular.ttf", weight: "400", style: "normal" },
    // { path: "../fonts/Gilroy-Medium.ttf", weight: "500", style: "normal" },
    // { path: "../fonts/Gilroy-SemiBold.ttf", weight: "600", style: "normal" },
    // { path: "../fonts/Gilroy-Bold.ttf", weight: "700", style: "normal" },
    // { path: "../fonts/Gilroy-ExtraBold.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-gilroy",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});
