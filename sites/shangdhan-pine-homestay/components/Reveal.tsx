"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { duration, ease } from "@/lib/motion";

// Book 17 Ch5 -- Intersection Observer for entry reveals, threshold in the
// 20-30% range, fires once. Book 04 Ch3/4 -- `section` duration, `standard`
// easing. No animation library: transform/opacity only, via CSS transition,
// keeps this well under the Book 20 JS budget.
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className ?? ""}`}
      style={{
        transitionDuration: `${duration.sectionMs}ms`,
        transitionTimingFunction: ease.standardCss,
        transitionDelay: visible ? `${delay}s` : "0s",
      }}
    >
      {children}
    </div>
  );
}
