import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { NextSeo } from "next-seo";
import Header from "@/layouts/Pages/components/header";
import Footer from "@/layouts/Pages/components/footer";
import { ScrollProgress } from "@/common/Overlays";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const MARQUEE_ITEMS = [
  "ServiceNow",
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "three.js",
  "Framer Motion",
  "Contentlayer",
  "Playwright",
  "Docker",
];

const TitleLine = ({
  children,
  delay,
  reduced,
}: {
  children: React.ReactNode;
  delay: number;
  reduced: boolean | null;
}) => (
  <span className="line">
    <motion.span
      initial={reduced ? false : { y: "105%" }}
      animate={reduced ? undefined : { y: 0 }}
      transition={{ duration: 1.1, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.span>
  </span>
);

export default function HomePage() {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  // Start paused when the user prefers reduced motion.
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduced) {
      setPaused(true);
      videoRef.current?.pause();
    }
  }, [reduced]);

  // Pause the ambient loop while the hero is off-screen (data + battery).
  useEffect(() => {
    if (reduced) return;
    const video = videoRef.current;
    if (!video || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;
        if (entry.isIntersecting) {
          if (!paused) videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(video);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const toggleVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  };

  const row = (key: string) => (
    <>
      {MARQUEE_ITEMS.map((item) => (
        <span key={`${key}-${item}`} style={{ display: "contents" }}>
          <span>{item}</span>
          <span className="s">✦</span>
        </span>
      ))}
    </>
  );

  return (
    <>
      <NextSeo
        title="WhiteRose Space — whiterose"
        description="Blog của một cựu web developer, giờ là ServiceNow developer. Viết về code và những thứ linh tinh."
      />
      <div id="top">
        <Header />
        <ScrollProgress />
      </div>
      <main>
        <section className="hero">
          <div className="hero__media">
            {reduced ? (
              // Decorative full-bleed backdrop: plain <img> avoids next/image wrapper overhead.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="hero__bg"
                src="/hero-drone-poster.jpg"
                alt=""
                aria-hidden="true"
              />
            ) : (
              <video
                ref={videoRef}
                className="hero__bg"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/hero-drone-poster.jpg"
                aria-hidden="true"
                tabIndex={-1}
                disablePictureInPicture
              >
                <source src="/hero-drone.mp4" type="video/mp4" />
              </video>
            )}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(90% 70% at 78% 12%, rgba(224,162,68,0.13) 0%, transparent 55%), radial-gradient(120% 100% at 20% 90%, rgba(224,162,68,0.05) 0%, transparent 60%)",
              }}
              aria-hidden="true"
            />
            <div className="hero__scrim" />
          </div>

          <div className="hero__content">
            <p className="hero__eyebrow">
              <span className="tick" />
              <span>ServiceNow Developer</span> <span className="x">×</span>{" "}
              <span>Web Developer</span>
            </p>
            <h1 className="hero__title">
              <TitleLine reduced={reduced} delay={0}>
                Tuan
              </TitleLine>
              <TitleLine reduced={reduced} delay={0.1}>
                Anh
              </TitleLine>
            </h1>
            <p className="hero__alias">
              <span className="br">[</span>&nbsp;whiterose&nbsp;
              <span className="br">]</span>
            </p>
            <p className="hero__lede">
              Blog của một cựu web developer, giờ là ServiceNow developer. Viết
              về code và những thứ linh tinh.
            </p>
            <div className="hero__actions">
              <Link className="btn btn--primary" href="/blog">
                <span>Đọc blog</span>
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path
                    d="M5 12h13M13 6l6 6-6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link className="btn btn--ghost" href="/snippet">
                Snippet
              </Link>
            </div>
          </div>

          <div className="hero__meta">
            <div className="hero__metacol">
              <span className="k">Căn cứ</span>
              <span className="v">Việt Nam</span>
            </div>
            <div className="hero__metacol">
              <span className="k">Viết về</span>
              <span className="v">ServiceNow · Next.js · React</span>
            </div>
            <div className="hero__metacol">
              <span className="k">Trạng thái</span>
              <span className="v">Đang viết bài mới</span>
            </div>
            {!reduced && (
              <button
                type="button"
                className="hero__videotoggle"
                onClick={toggleVideo}
                aria-pressed={paused}
                aria-label={paused ? "Phát video nền" : "Tạm dừng video nền"}
                title={paused ? "Phát video nền" : "Tạm dừng video nền"}
              >
                {paused ? (
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <path d="M8 5v14l11-7z" fill="currentColor" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <path
                      d="M7 5h4v14H7zM13 5h4v14h-4z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </button>
            )}
          </div>

          <a className="hero__scroll" href="#more" aria-label="Cuộn xuống">
            <span className="hero__scrolltxt">Cuộn</span>
            <span className="hero__scrollline">
              <i />
            </span>
          </a>
        </section>

        <div className="marquee" id="more" aria-hidden="true">
          <div className="marquee__track">
            {row("a")}
            {row("b")}
          </div>
        </div>

        <section className="section wrap" id="latest">
          <p className="secnum">01 — Bắt đầu</p>
          <h2 className="h2">
            Chọn một <em>đường</em> để đi tiếp
          </h2>
          <div className="hero__actions">
            <Link className="btn btn--primary" href="/blog">
              <span>Blog</span>
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path
                  d="M5 12h13M13 6l6 6-6 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link className="btn btn--ghost" href="/about">
              Giới thiệu bản thân
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
