"use client";

import { useEffect } from "react";

// Last-resort boundary: it replaces the root layout, so it cannot rely on
// next-intl or the app's CSS — keep it self-contained.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Chunk fetches get reset on flaky networks; one fresh reload almost
    // always recovers. The timestamp guard stops a broken deploy from
    // looping the page forever.
    const isChunkError =
      error.name === "ChunkLoadError" || /load chunk/i.test(error.message);
    if (!isChunkError) return;
    const lastReload = Number(sessionStorage.getItem("chunk-reload-at") ?? 0);
    if (Date.now() - lastReload < 30_000) return;
    sessionStorage.setItem("chunk-reload-at", String(Date.now()));
    window.location.reload();
  }, [error]);

  return (
    <html lang="tk">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          fontFamily: "system-ui, sans-serif",
          background: "#F5F5F7",
          color: "#151C33",
          textAlign: "center",
          padding: 24,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
          Sahypa ýüklenmedi
        </h1>
        <p style={{ margin: 0, color: "#5c6178", maxWidth: 420 }}>
          Nädogry bir zat boldy. Täzeden synanyşyň.
          {error.digest ? ` (${error.digest})` : ""}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            border: "none",
            borderRadius: 999,
            padding: "12px 28px",
            background: "#F0703A",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Täzeden synanyş
        </button>
      </body>
    </html>
  );
}
