"use client";

import { useEffect, useRef, useState } from "react";
import { CircleDollarSign, MessageCircle, Network, ShoppingBag, Target } from "lucide-react";

const nodes = [
  { label: "DEMAND", Icon: Target },
  { label: "CHAT", Icon: MessageCircle },
  { label: "PARTNER", Icon: Network },
  { label: "COMMERCE", Icon: ShoppingBag },
  { label: "VALUE", Icon: CircleDollarSign },
];

export function InteractiveOrbit({ compact = false }: { compact?: boolean }) {
  const [angle, setAngle] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [clickedPaused, setClickedPaused] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const paused = hovered || clickedPaused;

  function cue() {
    try {
      const C = window.AudioContext;
      if (!C) return;
      const ctx = audio.current || new C();
      audio.current = ctx;
      if (ctx.state === "suspended") void ctx.resume();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(660, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.055);
      g.gain.setValueAtTime(0.035, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.055);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.055);
    } catch {}
  }

  useEffect(() => () => {
    if (audio.current) void audio.current.close();
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const delta = Math.min(now - last, 40);
      last = now;
      if (!paused) {
        setAngle((current) => (current + delta * 0.018) % 360);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  const size = compact
    ? "h-[290px] w-[290px] sm:h-[360px] sm:w-[360px]"
    : "h-[330px] w-[330px] sm:h-[430px] sm:w-[430px]";
  const radius = compact ? 112 : 142;

  return (
    <div
      className={"relative " + size}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="group"
      aria-label="Interactive Aslal connected growth orbit"
    >
      <div
        className={"absolute inset-[7%] rounded-full border border-[#E2B02A]/25 transition-shadow " + (paused ? "shadow-[0_0_45px_rgba(226,176,42,.10)]" : "shadow-[0_0_70px_rgba(226,176,42,.12)]")}
      />
      <div className="absolute inset-[18%] rounded-full border border-white/10" />
      <div className="absolute inset-[31%] rounded-full border border-[#E2B02A]/10" />

      <div className="absolute inset-0 grid place-items-center">
        <div className={"relative grid h-32 w-32 place-items-center rounded-full border border-[#E2B02A]/45 bg-[#0F172A]/90 shadow-[0_0_90px_rgba(226,176,42,.2)] backdrop-blur-xl transition-transform duration-300 sm:h-40 sm:w-40 " + (paused ? "scale-[1.03]" : "")}>
          <div className="text-center">
            <span className="mx-auto block h-3 w-3 rounded-full bg-[#E2B02A] shadow-[0_0_24px_#E2B02A]" />
            <strong className="mt-3 block text-sm tracking-[.18em] text-white">ASLAL</strong>
            <span className="mt-1 block font-mono text-[8px] tracking-[.2em] text-[#E2B02A]">CONNECTED GROWTH</span>
          </div>
        </div>
      </div>

      {nodes.map(({ label, Icon }, i) => {
        const nodeAngle = angle + (360 / nodes.length) * i - 90;
        const radians = (nodeAngle * Math.PI) / 180;
        const x = Math.cos(radians) * radius;
        const y = Math.sin(radians) * radius;
        return (
          <button
            key={label}
            type="button"
            aria-label={paused ? `Resume Aslal connected growth animation from ${label}` : `Pause Aslal connected growth animation at ${label}`}
            aria-pressed={clickedPaused}
            onMouseEnter={cue}
            onFocus={() => {
              setHovered(true);
              cue();
            }}
            onBlur={() => setHovered(false)}
            onClick={() => {
              setClickedPaused((current) => !current);
              cue();
            }}
            style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
            className="absolute left-1/2 top-1/2 grid h-14 w-[108px] place-items-center rounded-full border border-white/10 bg-[#1E293B]/95 text-white shadow-xl backdrop-blur-md transition-[border-color,box-shadow,scale] duration-200 hover:scale-105 hover:border-[#E2B02A]/80 hover:shadow-[0_0_28px_rgba(226,176,42,.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2B02A]"
          >
            <span className="flex items-center gap-1.5 text-[9px] font-black tracking-[.04em]">
              <Icon size={14} className="text-[#E2B02A]" aria-hidden="true" />
              {label}
            </span>
          </button>
        );
      })}

      <span className="sr-only">{paused ? "Animation paused. Click any bubble to resume or pause." : "Animation is running. Hover or click a bubble to pause."}</span>
    </div>
  );
}
