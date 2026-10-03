"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  ChartNoAxesCombined,
  CircleDollarSign,
  CloudCog,
  Globe2,
  MessageCircle,
  Network,
  Radio,
  Send,
  ShoppingBag,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const nodes = [
  { id: "demand", label: "DEMAND", sub: "Intent detected", icon: Target, x: 50, y: 16 },
  { id: "conversation", label: "CONVERSATION", sub: "Human + AI", icon: MessageCircle, x: 18, y: 43 },
  { id: "match", label: "MATCH", sub: "Best next step", icon: Network, x: 50, y: 47 },
  { id: "commerce", label: "COMMERCE", sub: "Order + payment", icon: ShoppingBag, x: 82, y: 43 },
  { id: "partner", label: "PARTNER", sub: "Attributed growth", icon: Users, x: 27, y: 76 },
  { id: "revenue", label: "REVENUE", sub: "Measured outcome", icon: CircleDollarSign, x: 73, y: 76 },
];

const links = [
  ["demand", "conversation"],
  ["demand", "match"],
  ["demand", "commerce"],
  ["conversation", "match"],
  ["match", "commerce"],
  ["conversation", "partner"],
  ["match", "partner"],
  ["match", "revenue"],
  ["commerce", "revenue"],
];

export function HomeDemandConstellation() {
  const reduce = useReducedMotion();
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div className="relative mx-auto aspect-[1.04] w-full max-w-[620px] select-none" aria-label="Aslal connected demand and commerce system">
      <div className="absolute inset-[7%] rounded-full bg-[#E2B02A]/10 blur-3xl" />
      <div className="absolute inset-[12%] rounded-full border border-white/10 bg-[#0F3E8A]/20 backdrop-blur-[2px]" />
      <div className="absolute inset-[23%] rounded-full border border-[#E2B02A]/10" />
      <div className="absolute inset-[34%] rounded-full border border-white/10" />

      <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <filter id="aslal-glow">
            <feGaussianBlur stdDeviation="1.6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {links.map(([from, to], index) => {
          const a = byId[from], b = byId[to];
          return (
            <g key={from + to}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(248,250,252,.16)" strokeWidth=".28" />
              {!reduce && (
                <motion.circle
                  r=".65"
                  fill="#E2B02A"
                  filter="url(#aslal-glow)"
                  initial={{ cx: a.x, cy: a.y, opacity: 0 }}
                  animate={{ cx: [a.x, b.x], cy: [a.y, b.y], opacity: [0, 1, 0] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "linear", delay: index * .23 }}
                />
              )}
            </g>
          );
        })}
      </svg>

      <motion.div
        className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
        animate={reduce ? undefined : { scale: [1, 1.035, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative grid h-32 w-32 place-items-center rounded-full border border-[#E2B02A]/50 bg-[#1E293B]/95 shadow-[0_0_70px_rgba(226,176,42,.20)] backdrop-blur-xl sm:h-40 sm:w-40">
          <div className="absolute inset-2 rounded-full border border-white/10" />
          <div className="text-center">
            <Sparkles className="mx-auto mb-2 h-5 w-5 text-[#E2B02A]" />
            <p className="text-[9px] font-black tracking-[.2em] text-white/50">ASLAL</p>
            <p className="mt-1 text-lg font-black tracking-tight text-white">GROWTH OS</p>
            <p className="mt-1 text-[8px] font-bold uppercase tracking-[.16em] text-[#E2B02A]">CONNECTED</p>
          </div>
        </div>
      </motion.div>

      {nodes.map((node, index) => {
        const Icon = node.icon;
        return (
          <motion.div
            key={node.id}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: node.x + "%", top: node.y + "%" }}
            whileHover={{ scale: 1.08, zIndex: 30 }}
            transition={{ duration: .2 }}
          >
            <Link
              href={node.id === "demand" ? "/contact" : node.id === "commerce" ? "/products" : node.id === "conversation" ? "/telegram" : "/growth-builder"}
              className="group block w-[116px] rounded-2xl border border-white/10 bg-[#1E293B]/85 p-3 shadow-2xl backdrop-blur-xl transition hover:border-[#E2B02A]/60 hover:bg-[#1E293B] sm:w-[132px] sm:p-3.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/[.06] text-[#E2B02A] group-hover:bg-[#E2B02A]/10">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[8px] font-mono text-white/25">0{index + 1}</span>
              </div>
              <p className="mt-3 text-[9px] font-black tracking-[.12em] text-white">{node.label}</p>
              <p className="mt-1 text-[9px] text-white/45">{node.sub}</p>
            </Link>
          </motion.div>
        );
      })}

      <div className="absolute bottom-[3%] left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#1E293B]/75 px-4 py-2 text-[8px] font-black tracking-[.16em] text-white/50 shadow-xl backdrop-blur-xl">
        <Radio className="h-3 w-3 text-[#E2B02A]" />
        LIVE COMMERCIAL SIGNAL
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#E2B02A]" />
      </div>
    </div>
  );
}

export function HomeSignalStrip() {
  const items: Array<[typeof Globe2, string]> = [
    [Globe2, "WEB"],
    [MessageCircle, "WHATSAPP"],
    [Send, "TELEGRAM"],
    [Bot, "AUTOMATION"],
    [CloudCog, "CRM"],
    [ChartNoAxesCombined, "ANALYTICS"],
    [Zap, "ATTRIBUTION"],
    [BrainCircuit, "INTELLIGENCE"],
  ];
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-[#1E293B]/80 py-3 backdrop-blur-xl">
      <div className="flex min-w-max animate-[aslalMarquee_30s_linear_infinite] items-center gap-8 px-6">
        {[...items, ...items].map(([Icon, label], i) => {
          const I = Icon as typeof Globe2;
          return (
            <span key={label + i} className="flex items-center gap-2 text-[9px] font-black tracking-[.18em] text-white/45">
              <I className="h-3.5 w-3.5 text-[#E2B02A]" />
              {label as string}
              <span className="ml-4 h-1 w-1 rounded-full bg-[#E2B02A]/60" />
            </span>
          );
        })}
      </div>
    </div>
  );
}
