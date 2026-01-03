import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await fetch(
      "https://feeds.bbci.co.uk/news/world/rss.xml",
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    const text = await response.text();

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(text);
  } catch (err) {
    res.status(500).send("Failed to fetch BBC RSS");
  }
}
