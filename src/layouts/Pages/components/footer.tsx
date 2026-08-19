import { BsDiscFill, BsPauseCircle } from "react-icons/bs";
import useSWR from "swr";

type NowPlayingSong = {
  album: string;
  albumImageUrl: string;
  artist: string;
  isPlaying: boolean;
  songUrl: string;
  title: string;
};

export async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const res = await fetch(input, init);
  return res.json();
}

const Footer = () => {
  const { data } = useSWR<NowPlayingSong>("/api/spotify", fetcher, {
    refreshInterval: 20000,
  });

  return (
    <footer className="mx-auto max-w-screen-lg px-5 py-8">
      <div className="flex flex-row items-center justify-between border-t border-highlightHigh pt-5">
        <div className="flex min-w-0 flex-row items-center gap-3 text-sm">
          {data?.isPlaying ? (
            <BsDiscFill
              className="shrink-0 animate-spin text-love"
              aria-hidden="true"
            />
          ) : (
            <BsPauseCircle className="shrink-0 text-subtle" aria-hidden="true" />
          )}
          {data?.isPlaying ? (
            <a
              href={data.songUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate transition-colors hover:text-love"
              title={data.title + " - " + data.artist}
            >
              {data.title} - {data.artist}
            </a>
          ) : (
            <span className="text-subtle">Not playing</span>
          )}
        </div>
        <span className="shrink-0 text-sm text-subtle">
          © {new Date().getFullYear()} WhiteRose
        </span>
      </div>
    </footer>
  );
};

export default Footer;
