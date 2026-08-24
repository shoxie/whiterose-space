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

/** Only ever talks to our own /api/spotify route (allowlisted literal path). */
async function fetchNowPlaying(): Promise<NowPlayingSong | undefined> {
  try {
    const res = await fetch("/api/spotify");
    if (!res.ok) return undefined;
    return res.json();
  } catch {
    return undefined;
  }
}

/** Footer ported from F:/code/portfolio, with the Spotify now-playing line folded in. */
export default function Footer() {
  const { data } = useSWR<NowPlayingSong | undefined>(
    "/api/spotify",
    fetchNowPlaying,
    {
      refreshInterval: 20000,
    },
  );

  return (
    <footer className="footer">
      <div className="wrap footer__in">
        <div className="footer__l">
          <span className="footer__brand">WhiteRose</span>
          <span className="footer__alias">白薔薇</span>
        </div>
        <p className="footer__c flex items-center gap-2">
          {data?.isPlaying ? (
            <BsDiscFill
              className="shrink-0 animate-spin text-[var(--accent)]"
              aria-hidden="true"
            />
          ) : (
            <BsPauseCircle
              className="shrink-0 text-[var(--muted)]"
              aria-hidden="true"
            />
          )}
          {data?.isPlaying ? (
            <a
              href={data.songUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--accent)]"
              title={data.title + " - " + data.artist}
            >
              {data.title} — {data.artist}
            </a>
          ) : (
            <span>© {new Date().getFullYear()} — WhiteRose Space</span>
          )}
        </p>
        <a
          className="footer__top"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <span>Lên đầu trang</span>
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path
              d="M12 19V6M6 12l6-6 6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </footer>
  );
}
