"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import styles from "./CinematicHero.module.css";
import { FONT_CHOICES, googleFontsStylesheetUrl, type TextCase } from "@/lib/fonts";
import {
  computeWordAutoLayout,
  wordTransform,
  LAYER_Z_INDEX,
  type HeadlineLayer,
} from "@/lib/headline-layout";

export type CinematicHeroContent = {
  skyImageUrl: string | null;
  skyVideoUrl: string | null;
  glowImageUrl: string | null;
  midgroundImageUrl: string | null;
  heroHeadline: string | null;
  introParagraph: string | null;
  heroTags: string[];
  splitframeLeftUrl: string | null;
  splitframeRightUrl: string | null;
  mainImageUrl: string | null;
  mainVideoUrl: string | null;
  closeupImageUrl: string | null;
  panel1Heading: string | null;
  panel1Paragraph: string | null;
  panel1Facts: { value: string; label: string }[];
  panel2Heading: string | null;
  panel2Paragraph: string | null;
  panel2CtaLabel: string | null;
};

export type CinematicSightCard = {
  id: string;
  kicker: string | null;
  title: string | null;
  description: string | null;
  pinIconUrl: string | null;
};

export type CinematicHeadlineSegment = {
  id: string;
  text: string;
  fontChoice: string | null;
  textCase: TextCase;
  color: string | null;
  sizeMultiplier: number;
  offsetX: number;
  offsetY: number;
  layer: HeadlineLayer;
};

// ---- easing helpers, ported verbatim from the scroll-choreography spec ----

function clamp(v: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, v));
}
function smoothstep(e0: number, e1: number, v: number) {
  const x = clamp((v - e0) / (e1 - e0));
  return x * x * (3 - 2 * x);
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function segmentInOut(s: number, a: number, b: number, c: number, d: number) {
  const enter = smoothstep(a, b, s);
  const exit = smoothstep(c, d, s);
  return { enter, exit, active: enter * (1 - exit) };
}

export function CinematicHero({
  hero,
  sightCards,
  headlineSegments = [],
  headlineThemeColor,
}: {
  hero: CinematicHeroContent;
  sightCards: CinematicSightCard[];
  headlineSegments?: CinematicHeadlineSegment[];
  headlineThemeColor?: string | null;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const cardRefs = useRef<HTMLElement[]>([]);

  const originalCount = sightCards.length;

  // Any per-word font choices that differ from the site's own display font
  // need their own stylesheet -- next/font can't load a runtime-chosen
  // font, so this mirrors the same <link> approach app/(public)/layout.tsx
  // uses for the site-wide font.
  const segmentFontFamilies = useMemo(() => {
    const chosenIds = new Set(
      headlineSegments.map((s) => s.fontChoice).filter((id): id is string => Boolean(id))
    );
    return FONT_CHOICES.filter((f) => chosenIds.has(f.id));
  }, [headlineSegments]);

  const wordsWithAutoLayout = useMemo(
    () => computeWordAutoLayout(headlineSegments),
    [headlineSegments]
  );

  // Three identical sets back to back, so the slider can loop seamlessly --
  // start in the middle set and jump a whole set backward/forward whenever
  // the visible position drifts into set 1 or set 3.
  const tripled = useMemo(
    () =>
      originalCount === 0
        ? []
        : [0, 1, 2].flatMap((setIndex) =>
            sightCards.map((card, cardIndex) => ({
              ...card,
              sightIndex: setIndex * originalCount + cardIndex,
              renderKey: `${setIndex}-${card.id}`,
            }))
          ),
    [sightCards, originalCount]
  );

  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;
    const section: HTMLElement = sectionEl;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetScroll = 0;
    let smoothScroll = 0;
    let initialized = false;
    let rafPending = false;
    let activeSight = originalCount;

    function getScrollDistance() {
      const rect = section.getBoundingClientRect();
      return clamp(-rect.top, 0, section.offsetHeight - window.innerHeight);
    }

    function updateSightSlider() {
      const track = trackRef.current;
      const cards = cardRefs.current;
      if (!track || cards.length === 0) return;
      const cardWidth = cards[0].offsetWidth;
      const gap = parseFloat(getComputedStyle(track).columnGap || "0");
      section.style.setProperty("--sights-shift", `${-(cardWidth + gap) * activeSight}px`);
      cards.forEach((card, idx) => {
        card.classList.toggle(styles["is-active"]!, idx === activeSight);
      });
    }

    function jumpSightSlider(i: number) {
      trackRef.current?.classList.add(styles["is-jumping"]!);
      activeSight = i;
      updateSightSlider();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          trackRef.current?.classList.remove(styles["is-jumping"]!);
        });
      });
    }

    function normalizeSightSlider() {
      if (originalCount === 0) return;
      if (activeSight >= originalCount * 2) jumpSightSlider(activeSight - originalCount);
      else if (activeSight < originalCount) jumpSightSlider(activeSight + originalCount);
    }

    function moveSightSlider(dir: number) {
      activeSight += dir;
      updateSightSlider();
    }

    function selectSightCard(index: number) {
      activeSight = index;
      updateSightSlider();
    }

    function requestTick() {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(update);
    }

    function update() {
      rafPending = false;

      targetScroll = getScrollDistance();
      if (!initialized || reduceMotion.matches) {
        smoothScroll = targetScroll;
        initialized = true;
      } else {
        smoothScroll = lerp(smoothScroll, targetScroll, 0.14);
      }
      if (Math.abs(smoothScroll - targetScroll) < 0.08) smoothScroll = targetScroll;

      mouseX = lerp(mouseX, targetMouseX, 0.12);
      mouseY = lerp(mouseY, targetMouseY, 0.12);

      const frame2 = segmentInOut(smoothScroll, 560, 900, 1300, 1620);
      const frame3 = segmentInOut(smoothScroll, 1760, 2140, 2540, 2700);
      const progress = clamp(smoothScroll / 2700);
      const introExit = smoothstep(90, 650, smoothScroll);
      const sightsEnterRaw = smoothstep(2760, 3560, smoothScroll);
      const sightsEnter = Math.pow(sightsEnterRaw, 1.55);
      const sightsControlsEnter = smoothstep(3360, 3660, smoothScroll);
      const blurActive = clamp(frame2.active + frame3.active);
      const frame2Opacity = frame2.active * (1 - frame3.enter);
      const splitDrift = Math.pow(frame2.enter, 1.5);
      const panel2Opacity = frame2.active * (1 - frame2.exit);
      const panel3Opacity = frame3.active * (1 - frame3.exit);
      const backScale = 0.76 + progress * 0.2 + frame2.enter * 0.18 + frame3.enter * 0.16;
      const sharedHeroY = progress * -74;
      const sharedHeroScale = progress * 0.23;
      const sightsScreenTop = Math.min(220, Math.max(112, window.innerHeight * 0.19)) - 50;
      const sightsParentTop =
        window.innerHeight - (window.innerHeight - sightsScreenTop) / backScale;

      const mx = reduceMotion.matches ? 0 : mouseX;
      const my = reduceMotion.matches ? 0 : mouseY;
      const s = section.style;

      s.setProperty("--mx", mx.toFixed(4));
      s.setProperty("--my", my.toFixed(4));

      s.setProperty("--back-opacity", String(1 - frame2.active * 0.06));
      s.setProperty("--back-x", `${mx * -12}px`);
      s.setProperty("--back-y", `${my * -4}px`);
      s.setProperty("--back-scale", String(backScale));
      s.setProperty("--four-y", `${10 + progress * 10}vh`);
      s.setProperty("--four-scale", String(0.78 + progress * 0.16));
      s.setProperty("--bazaar-y", `${20 - progress * 8}vh`);
      s.setProperty("--blur-px", `${blurActive * 14}px`);
      s.setProperty("--back-brightness", String(1 - blurActive * 0.255));
      s.setProperty("--bazaar-blur-px", `${frame2.active * 14}px`);
      s.setProperty("--bazaar-brightness", String(1 - frame2.active * 0.255 - frame3.active * 0.06));
      s.setProperty("--bazaar-saturation", String(1 + frame3.active * 0.18));
      s.setProperty("--shade-opacity", "1");
      s.setProperty("--shade-z", frame2.active > 0.02 ? "2" : "0");
      s.setProperty("--shade-top-alpha", String(blurActive * 0.465));
      s.setProperty("--shade-mid-alpha", String(blurActive * 0.42));
      s.setProperty("--shade-bottom-alpha", String(blurActive * 0.51));

      s.setProperty("--title-y", `${introExit * -210}px`);
      s.setProperty("--title-scale", String(1 - introExit * 0.08));
      s.setProperty("--title-opacity", String(1 - introExit));

      s.setProperty("--bridge-x", `calc(-50% + ${mx * 18}px)`);
      s.setProperty("--bridge-y", `${my * 8 + sharedHeroY - frame2.exit * 760}px`);
      s.setProperty("--bridge-bottom", `${5 - frame2.enter * 13}vh`);
      s.setProperty("--bridge-width", `${67.2 + frame2.enter * 37.8}vw`);
      s.setProperty("--bridge-scale", String(1.02 + sharedHeroScale + frame2.exit * 0.46));

      s.setProperty("--split-left-x", `calc(-50% + ${-splitDrift * 46}vw + ${mx * 22}px)`);
      s.setProperty("--split-left-y", `${my * 10 + sharedHeroY - splitDrift * 180}px`);
      s.setProperty("--split-left-scale", String(1 + sharedHeroScale + frame2.enter * 0.74));
      s.setProperty("--split-right-x", `calc(-50% + ${splitDrift * 46}vw + ${mx * 22}px)`);
      s.setProperty("--split-right-y", `${my * 10 + sharedHeroY - splitDrift * 180}px`);
      s.setProperty("--split-right-scale", String(1 + sharedHeroScale + frame2.enter * 0.74));

      s.setProperty("--frame2-opacity", String(frame2Opacity));
      s.setProperty("--frame2-x", `calc(-50% + ${mx * 10}px)`);
      s.setProperty("--frame2-y", `calc(-50% + ${my * 8 - frame2.exit * 150}px)`);
      s.setProperty("--frame2-scale", String(1.06 + frame2.enter * 0.08 + frame2.exit * 0.08));

      s.setProperty("--intro-copy-y", `${introExit * 90}px`);
      s.setProperty("--intro-copy-opacity", String(1 - introExit));
      s.setProperty("--panel2-opacity", String(panel2Opacity));
      s.setProperty("--panel2-y", `calc(-50% + ${-frame2.exit * 86 + (1 - frame2.enter) * 58}px)`);
      s.setProperty("--panel3-opacity", String(panel3Opacity));
      s.setProperty("--panel3-y", `calc(-50% + ${-frame3.exit * 86 + (1 - frame3.enter) * 58}px)`);

      s.setProperty("--sights-opacity", String(sightsEnter));
      s.setProperty("--sights-controls-opacity", String(sightsControlsEnter));
      controlsRef.current?.classList.toggle(styles["is-ready"]!, sightsControlsEnter > 0.98);
      s.setProperty("--sights-visibility", sightsEnter > 0.01 ? "visible" : "hidden");
      s.setProperty("--sights-y", "0px");
      s.setProperty("--sights-enter-x", `${(1 - sightsEnter) * 420}vw`);
      s.setProperty("--sights-scale", String(1 / backScale));
      s.setProperty("--sights-top", `${sightsParentTop}px`);
      s.setProperty("--sights-screen-top", `${sightsScreenTop}px`);

      if (
        Math.abs(smoothScroll - targetScroll) > 0.08 ||
        Math.abs(mouseX - targetMouseX) > 0.001 ||
        Math.abs(mouseY - targetMouseY) > 0.001
      ) {
        requestTick();
      }
    }

    function onScroll() {
      requestTick();
    }
    function onResize() {
      updateSightSlider();
      requestTick();
    }
    function onPointerMove(e: PointerEvent) {
      targetMouseX = e.clientX / window.innerWidth - 0.5;
      targetMouseY = e.clientY / window.innerHeight - 0.5;
      requestTick();
    }
    function onPrevClick() {
      moveSightSlider(-1);
    }
    function onNextClick() {
      moveSightSlider(1);
    }
    function onTrackTransitionEnd() {
      normalizeSightSlider();
    }

    // Captured now, not read from the ref again in cleanup -- by the time
    // cleanup runs the ref may already point somewhere else (or nowhere).
    const prevEl = prevRef.current;
    const nextEl = nextRef.current;
    const trackEl = trackRef.current;

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    prevEl?.addEventListener("click", onPrevClick);
    nextEl?.addEventListener("click", onNextClick);
    trackEl?.addEventListener("transitionend", onTrackTransitionEnd);

    const cardClickHandlers = cardRefs.current.map((card, idx) => {
      const onClick = () => selectSightCard(idx);
      const onKeydown = (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectSightCard(idx);
        }
      };
      card.addEventListener("click", onClick);
      card.addEventListener("keydown", onKeydown);
      return { card, onClick, onKeydown };
    });

    updateSightSlider();
    requestTick();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      prevEl?.removeEventListener("click", onPrevClick);
      nextEl?.removeEventListener("click", onNextClick);
      trackEl?.removeEventListener("transitionend", onTrackTransitionEnd);
      cardClickHandlers.forEach(({ card, onClick, onKeydown }) => {
        card.removeEventListener("click", onClick);
        card.removeEventListener("keydown", onKeydown);
      });
    };
  }, [originalCount]);

  return (
    <section
      ref={sectionRef}
      aria-label="Homestay cinematic scroll story"
      className={styles["cinema-scroll"]}
    >
      <div className={styles.stage}>
        <div className={styles.world}>
          {hero.skyVideoUrl ? (
            <video
              className={`${styles["scene-img"]} ${styles["sky-img"]}`}
              src={hero.skyVideoUrl}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : hero.skyImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- full-bleed, transform/filter-driven scene layer, not a fit for next/image
            <img className={`${styles["scene-img"]} ${styles["sky-img"]}`} src={hero.skyImageUrl} alt="" />
          ) : null}

          <div className={styles["back-stack"]}>
            {hero.glowImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className={`${styles["scene-img"]} ${styles["back-img"]} ${styles["back-four"]}`}
                src={hero.glowImageUrl}
                alt=""
              />
            ) : null}

            {originalCount > 0 ? (
              <section className={styles["sights-slider"]} aria-label="Nearby sights slider">
                <div ref={trackRef} className={styles["sights-track"]}>
                  {tripled.map((card, i) => (
                    <article
                      key={card.renderKey}
                      ref={(el) => {
                        if (el) cardRefs.current[i] = el;
                      }}
                      className={styles["sight-card"]}
                      tabIndex={0}
                      role="button"
                      aria-label={`Open ${card.title ?? "sight"} card`}
                      data-sight-index={card.sightIndex}
                    >
                      {card.kicker ? <span className={styles["sight-kicker"]}>{card.kicker}</span> : null}
                      {card.pinIconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className={styles["sight-pin"]} src={card.pinIconUrl} alt="" />
                      ) : null}
                      <h3>{card.title}</h3>
                      <p>{card.description}</p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {hero.midgroundImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className={`${styles["scene-img"]} ${styles["back-img"]} ${styles["back-bazaar"]}`}
                src={hero.midgroundImageUrl}
                alt=""
              />
            ) : null}
          </div>

          {originalCount > 0 ? (
            <div ref={controlsRef} className={styles["sights-controls"]} aria-label="Slider controls">
              <button ref={prevRef} type="button" className={styles["sight-nav"]} aria-label="Previous sight">
                &#8592;
              </button>
              <button ref={nextRef} type="button" className={styles["sight-nav"]} aria-label="Next sight">
                &#8594;
              </button>
            </div>
          ) : null}

          {segmentFontFamilies.length > 0 ? (
            <link
              rel="stylesheet"
              href={googleFontsStylesheetUrl(segmentFontFamilies.map((f) => f.cssFamily))}
            />
          ) : null}

          {headlineSegments.length > 0 ? (
            // A plain, unpositioned wrapper -- purely for one semantic <h1>
            // per hero. It has no position/transform of its own, so each
            // word span's position:absolute (see .hero-title-word) resolves
            // against .world, same as if they were direct siblings of it.
            <h1 className={styles["hero-title-wrapper"]}>
              {wordsWithAutoLayout.map(({ segment, autoXem }) => {
                const font = segment.fontChoice
                  ? FONT_CHOICES.find((f) => f.id === segment.fontChoice)
                  : null;
                return (
                  <span
                    key={segment.id}
                    className={styles["hero-title-word"]}
                    style={{
                      fontFamily: font ? `'${font.fontFamily}', var(--font-display)` : undefined,
                      textTransform: segment.textCase === "none" ? undefined : segment.textCase,
                      color: segment.color || headlineThemeColor || undefined,
                      transform: wordTransform(
                        autoXem,
                        segment.offsetX,
                        segment.offsetY,
                        segment.sizeMultiplier,
                        "var(--title-y)",
                        "var(--title-scale)"
                      ),
                      zIndex: LAYER_Z_INDEX[segment.layer],
                    }}
                  >
                    {segment.text}
                  </span>
                );
              })}
            </h1>
          ) : (
            <h1 className={styles["hero-title"]}>{hero.heroHeadline || "KAFFER"}</h1>
          )}

          {hero.splitframeLeftUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={`${styles["scene-img"]} ${styles["splitframe-img"]} ${styles["splitframe-left"]}`}
              src={hero.splitframeLeftUrl}
              alt=""
            />
          ) : null}
          {hero.splitframeRightUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={`${styles["scene-img"]} ${styles["splitframe-img"]} ${styles["splitframe-right"]}`}
              src={hero.splitframeRightUrl}
              alt=""
            />
          ) : null}

          {hero.mainVideoUrl ? (
            <video
              className={`${styles["scene-img"]} ${styles["bridge-img"]}`}
              src={hero.mainVideoUrl}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : hero.mainImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={`${styles["scene-img"]} ${styles["bridge-img"]}`} src={hero.mainImageUrl} alt="" />
          ) : null}

          {hero.closeupImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={`${styles["scene-img"]} ${styles["frame-two-img"]}`}
              src={hero.closeupImageUrl}
              alt=""
            />
          ) : null}

          <div className={styles.shade} />
        </div>

        {hero.introParagraph || hero.heroTags.length > 0 ? (
          <div className={styles["intro-copy"]} aria-label="Homestay overview">
            {hero.introParagraph ? <p>{hero.introParagraph}</p> : null}
            {hero.heroTags.length > 0 ? (
              <div className={styles["hero-tags"]} aria-label="Homestay highlights">
                {hero.heroTags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {hero.panel1Heading || hero.panel1Paragraph ? (
          <section
            className={`${styles["story-panel"]} ${styles["story-panel-bridge"]}`}
            aria-label="Homestay building details"
          >
            {hero.panel1Heading ? <h2>{hero.panel1Heading}</h2> : null}
            {hero.panel1Paragraph ? <p>{hero.panel1Paragraph}</p> : null}
            {hero.panel1Facts.length > 0 ? (
              <dl className={styles.facts}>
                {hero.panel1Facts.map((fact) => (
                  <div key={`${fact.value}-${fact.label}`}>
                    <dt>{fact.value}</dt>
                    <dd>{fact.label}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </section>
        ) : null}

        {hero.panel2Heading || hero.panel2Paragraph ? (
          <section
            className={`${styles["story-panel"]} ${styles["story-panel-bazaar"]}`}
            aria-label="Garden and grounds details"
          >
            {hero.panel2Heading ? <h2>{hero.panel2Heading}</h2> : null}
            {hero.panel2Paragraph ? <p>{hero.panel2Paragraph}</p> : null}
            {hero.panel2CtaLabel ? (
              <Link href="#garden" className={styles["note-button"]}>
                <span className={styles["note-icon"]} aria-hidden="true">
                  &#8599;
                </span>
                <span>{hero.panel2CtaLabel}</span>
              </Link>
            ) : null}
          </section>
        ) : null}
      </div>
    </section>
  );
}
