import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Calopro · Meublés à Saint-Malo",
    short_name: "Calopro",
    lang: "fr",
    start_url: "/",
    display: "standalone",
    background_color: "#f2f5f4",
    theme_color: "#0b6b5c",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
