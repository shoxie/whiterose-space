import type { NextApiRequest, NextApiResponse } from "next";
import { getTopTracks } from "src/lib/spotify";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await getTopTracks();

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch top tracks" });
    }

    const { items } = await response.json();
    const tracks = items.slice(0, 10).map((track: any) => ({
      artist: track.artists.map((_artist: any) => _artist.name).join(", "),
      songUrl: track.external_urls.spotify,
      title: track.name,
      imageUrl: track.album.images[0]?.url,
      previewUrl: track.preview_url,
    })).filter((t: any) => t.previewUrl);

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=43200"
    );

    return res.status(200).json({ tracks });
  } catch {
    return res.status(500).json({ error: "Failed to fetch top tracks" });
  }
}
