import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useState } from "react";
import { BsArrowRight } from "react-icons/bs";
import Header from "@/layouts/Pages/components/header";
import StaticSharingan from "@/modules/Home/components/StaticSharingan";
import RedMoon from "@/modules/Home/components/RedMoon";
import AkatsukiCloud from "@/modules/Home/components/AkatsukiCloud";
import KamuiOverlay from "@/modules/Home/components/KamuiOverlay";

const SharinganScene = dynamic(
  () => import("@/modules/Home/components/SharinganScene"),
  {
    ssr: false,
    loading: () => (
      <StaticSharingan className="h-[260px] w-[260px] md:h-[340px] md:w-[340px]" />
    ),
  }
);

const EMBERS = [
  { left: "8%", delay: 0, duration: 5 },
  { left: "16%", delay: 1.2, duration: 6 },
  { left: "27%", delay: 2.4, duration: 4.5 },
  { left: "38%", delay: 0.6, duration: 5.5 },
  { left: "52%", delay: 1.8, duration: 4.8 },
  { left: "63%", delay: 3, duration: 6.2 },
  { left: "74%", delay: 0.3, duration: 5.2 },
  { left: "85%", delay: 2.1, duration: 4.6 },
  { left: "93%", delay: 1, duration: 5.8 },
  { left: "45%", delay: 2.7, duration: 5 },
];

export default function GatePage() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [entering, setEntering] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 35, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 35, damping: 22 });

  const moonX = useTransform(springX, (v) => v * 0.35);
  const moonY = useTransform(springY, (v) => v * 0.35);
  const cloud1X = useTransform(springX, (v) => v * 0.6);
  const cloud1Y = useTransform(springY, (v) => v * 0.6);
  const cloud2X = useTransform(springX, (v) => v * -0.5);
  const emberX = useTransform(springX, (v) => v * 1.35);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (reduced) return;
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 22;
    const y = (e.clientY / innerHeight - 0.5) * 14;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const enter = () => {
    if (entering) return;
    if (reduced) {
      router.push("/blog");
      return;
    }
    setEntering(true);
    window.setTimeout(() => {
      router.push("/blog");
    }, 1100);
  };

  return (
    <div className="moon" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <NextSeo
        title="写輪眼 — WhiteRose Space"
        description="Blog của Đào Tuấn Anh — cựu web developer, giờ là ServiceNow developer. Nhấn vào Sharingan để vào blog."
      />
      <Header />
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0A070D] px-6 pb-16 pt-24 text-center">
        {/* Layer 0: Red moon - slowest parallax */}
        {reduced ? (
          <RedMoon className="absolute -right-16 top-[6%] w-[40vmin] min-w-[190px] opacity-80" />
        ) : (
          <motion.div
            className="absolute -right-16 top-[6%] w-[40vmin] min-w-[190px] opacity-80 will-change-transform"
            style={{ x: moonX, y: moonY }}
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <RedMoon />
          </motion.div>
        )}

        {/* Layer 1: Obito hero image with Ken Burns + mouse parallax */}
        <motion.div
          className="absolute inset-0 overflow-hidden will-change-transform"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          aria-hidden="true"
        >
          <motion.div
            className="absolute inset-[-4%] will-change-transform"
            style={reduced ? undefined : { x: springX, y: springY }}
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Ken Burns inner */}
            <motion.div
              className="absolute inset-0"
              animate={reduced ? undefined : { scale: [1, 1.06, 1] }}
              transition={
                reduced
                  ? undefined
                  : { duration: 22, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <Image
                src="/static/images/obito-hero.jpg"
                alt="Obito Uchiha with Sharingan"
                fill
                priority
                className="object-cover object-[center_28%]"
                sizes="100vw"
              />
              {/* cinematic gradients for text readability - per UX 4.5:1 */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A070D] via-[#0A070D]/72 via-35% to-[#0A070D]/18" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A070D]/75 via-transparent to-[#0A070D]/45" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0A070D]/55 via-transparent to-transparent" />
              {/* vignette */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_58%,_rgba(10,7,13,0.78)_100%)]" />

              {/* wind streaks - subtle diagonal motion */}
              {!reduced && (
                <div className="absolute inset-0 overflow-hidden opacity-[0.18]">
                  <motion.div
                    className="absolute -inset-x-1/2 inset-y-0"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(108deg, transparent 0 52px, rgba(255,255,255,0.09) 52px 53px, transparent 53px 118px)",
                    }}
                    animate={{ x: [-80, 0] }}
                    transition={{ duration: 1.9, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute -inset-x-1/2 inset-y-0 opacity-60"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(108deg, transparent 0 94px, rgba(255,59,87,0.07) 94px 95px, transparent 95px 180px)",
                    }}
                    animate={{ x: [0, -120] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              )}

              {/* eye glow - anchored to Obito's sharingan in the photo */}
              <div className="absolute left-[49.2%] top-[42.5%] -translate-x-1/2 -translate-y-1/2">
                {/* outer chakra bloom */}
                <motion.div
                  className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF1840]/35 blur-[14px] md:h-28 md:w-28 md:blur-[22px]"
                  animate={
                    reduced
                      ? undefined
                      : { scale: [0.92, 1.22, 0.92], opacity: [0.55, 0.95, 0.55] }
                  }
                  transition={
                    reduced
                      ? undefined
                      : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
                  }
                />
                {/* mid glow */}
                <motion.div
                  className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF3B57]/70 blur-[6px] md:h-14 md:w-14"
                  animate={
                    reduced
                      ? undefined
                      : { scale: [1, 1.18, 1], opacity: [0.85, 1, 0.85] }
                  }
                  transition={
                    reduced
                      ? undefined
                      : { duration: 1.7, repeat: Infinity, ease: "easeInOut" }
                  }
                />
                {/* core */}
                <motion.div
                  className="absolute left-1/2 top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFEEF1] shadow-[0_0_10px_#FF1840,0_0_22px_#FF1840] md:h-[9px] md:w-[9px]"
                  animate={reduced ? undefined : { scale: [1, 1.45, 1] }}
                  transition={
                    reduced
                      ? undefined
                      : { duration: 1.7, repeat: Infinity, ease: "easeInOut" }
                  }
                />
                {/* expanding chakra ring */}
                {!reduced && (
                  <motion.div
                    className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#FF3B57]/50 md:h-10 md:w-10"
                    animate={{ scale: [0.7, 1.9], opacity: [0.65, 0] }}
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      ease: "easeOut",
                      repeatDelay: 0.7,
                    }}
                  />
                )}
                {!reduced && (
                  <motion.div
                    className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#FF6B7A]/30 md:h-10 md:w-10"
                    animate={{ scale: [0.7, 1.9], opacity: [0.45, 0] }}
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      ease: "easeOut",
                      delay: 0.45,
                      repeatDelay: 0.7,
                    }}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Clouds - mid parallax */}
        {reduced ? (
          <AkatsukiCloud className="absolute left-[4%] top-[18%] w-44 opacity-[0.14]" />
        ) : (
          <motion.div
            className="absolute left-[4%] top-[18%] w-44 opacity-[0.14] will-change-transform"
            style={{ x: cloud1X, y: cloud1Y }}
            animate={{ x: [0, 90, 0] }}
            transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          >
            <AkatsukiCloud />
          </motion.div>
        )}
        {reduced ? (
          <AkatsukiCloud className="absolute right-[2%] bottom-[16%] w-64 opacity-[0.10]" />
        ) : (
          <motion.div
            className="absolute right-[2%] bottom-[16%] w-64 opacity-[0.10] will-change-transform"
            style={{ x: cloud2X }}
            animate={{ x: [0, -70, 0] }}
            transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
          >
            <AkatsukiCloud />
          </motion.div>
        )}
        {reduced ? (
          <AkatsukiCloud className="absolute left-[18%] bottom-[6%] w-36 opacity-[0.09]" />
        ) : (
          <motion.div
            className="absolute left-[18%] bottom-[6%] w-36 opacity-[0.09] will-change-transform"
            style={{ x: cloud1X }}
            animate={{ x: [0, 55, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          >
            <AkatsukiCloud />
          </motion.div>
        )}

        {/* Embers - fastest parallax */}
        {!reduced &&
          EMBERS.map((ember, i) => (
            <motion.span
              key={i}
              className="absolute bottom-0 h-1.5 w-1.5 rounded-full bg-[#FF3B57] will-change-transform"
              style={{ left: ember.left, x: i % 3 === 0 ? emberX : undefined }}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 0.75, 0], y: [-20, -420] }}
              transition={{
                duration: ember.duration,
                delay: ember.delay,
                repeat: Infinity,
                ease: "linear",
              }}
              aria-hidden="true"
            />
          ))}

        <div className="relative z-10 flex flex-col items-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-3 text-sm font-semibold tracking-[0.6em] text-love drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]"
          >
            白薔薇
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="font-display text-4xl font-black tracking-tight text-text sm:text-6xl lg:text-7xl drop-shadow-[0_2px_18px_rgba(0,0,0,0.7)]"
          >
            WHITEROSE SPACE
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-4 max-w-md text-base text-subtle md:text-lg drop-shadow-[0_1px_10px_rgba(0,0,0,0.65)]"
          >
            Blog của một cựu web developer — giờ là ServiceNow developer.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
            className="relative mt-6 md:mt-8"
          >
            <div
              className="absolute inset-8 rounded-full bg-[#E11D2E]/20 blur-3xl"
              aria-hidden="true"
            />
            <p className="mb-1 text-xs tracking-[0.4em] text-subtle drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]">
              写輪眼 · NHẤN VÀO ĐỂ VÀO BLOG
            </p>
            <SharinganScene
              onEnter={enter}
              className="h-[240px] w-[240px] md:h-[320px] md:w-[320px] drop-shadow-[0_0_28px_rgba(225,29,46,0.35)]"
            />
          </motion.div>

          <motion.button
            type="button"
            onClick={enter}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="group mt-2 inline-flex min-h-[48px] items-center gap-3 rounded-full border-2 border-love bg-[#0A070D]/40 px-7 py-3 font-semibold text-love backdrop-blur-sm transition-colors duration-200 hover:bg-love hover:text-[#0A070D]"
          >
            Enter the Tsukuyomi
            <BsArrowRight
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </motion.button>

          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-subtle"
            aria-label="Quick links"
          >
            <Link href="/blog" className="transition-colors hover:text-love">
              Blog
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/snippet" className="transition-colors hover:text-love">
              Snippets
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/tag" className="transition-colors hover:text-love">
              Tags
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/about" className="transition-colors hover:text-love">
              About
            </Link>
          </motion.nav>
        </div>
      </main>
      {entering && <KamuiOverlay />}
    </div>
  );
}
