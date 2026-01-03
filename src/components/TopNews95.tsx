'use client';

import { useEffect, useState } from "react";

type NewsItem = {
  title: string;
  link: string;
};

export function TopNews95() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/bbc-news");
        if (!res.ok) throw new Error("Bad response");

        const text = await res.text();

        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/xml");
        const entries = Array.from(xml.querySelectorAll("item")).slice(0, 5);

        setItems(
          entries.map((item) => ({
            title: item.querySelector("title")?.textContent ?? "",
            link: item.querySelector("link")?.textContent ?? "",
          }))
        );
      } catch (e) {
        console.error(e);
        setError("Failed to load news");
      }
    }

    load();
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 12,
        left: 12,
        width: 320,
        fontFamily: "VT323, monospace",
        background: "#c0c0c0",
        borderTop: "2px solid #fff",
        borderLeft: "2px solid #fff",
        borderRight: "2px solid #404040",
        borderBottom: "2px solid #404040",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "linear-gradient(90deg, #000080, #1084d0)",
          color: "#fff",
          padding: "4px 6px",
          fontSize: 16,
        }}
      >
        📰 BBC World News
      </div>

      <div style={{ padding: 8, fontSize: 15 }}>
        {error && <div>{error}</div>}

        {!error &&
          items.map((item, i) => (
            <div
              key={i}
              style={{
                marginBottom: 6,
                paddingBottom: 4,
                borderBottom: "1px dotted #808080",
              }}
            >
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#000", textDecoration: "none" }}
              >
                ▶ {item.title}
              </a>
            </div>
          ))}
      </div>
    </div>
  );
}
