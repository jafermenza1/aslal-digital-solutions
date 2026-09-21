"use client";

import { useEffect, useRef } from "react";

type Node = { x: number; y: number; vx: number; vy: number; r: number };
type Packet = { a: number; b: number; t: number; speed: number };

export function PlexusBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let raf = 0;
    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let packets: Packet[] = [];
    const pointer = { x: 0.5, y: 0.45, active: false };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(76, Math.max(34, Math.floor((width * height) / 26000)));
      nodes = Array.from({ length: count }, (_, i) => ({
        x: (i * 137.7) % width,
        y: (i * 83.3) % height,
        vx: ((i * 17) % 11 - 5) * 0.012,
        vy: ((i * 23) % 9 - 4) * 0.012,
        r: 1.2 + ((i * 7) % 10) / 5,
      }));
      packets = Array.from({ length: Math.min(18, Math.floor(count / 3)) }, (_, i) => ({
        a: i % count,
        b: (i * 7 + 5) % count,
        t: (i * 0.17) % 1,
        speed: 0.0007 + (i % 4) * 0.00018,
      }));
    };

    const move = (event: PointerEvent) => {
      pointer.x = event.clientX / window.innerWidth;
      pointer.y = event.clientY / window.innerHeight;
      pointer.active = true;
    };
    const leave = () => { pointer.active = false; };

    const drawBadge = (x: number, y: number, label: string, phase: number) => {
      const pulse = 1 + Math.sin(frame * 0.0015 + phase) * 0.06;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(pulse, pulse);
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(248,250,252,.18)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(15,62,138,.48)";
      ctx.fill();
      ctx.strokeStyle = "rgba(226,176,42,.52)";
      ctx.stroke();
      ctx.fillStyle = "rgba(248,250,252,.88)";
      ctx.font = "800 10px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, 0, 1);
      ctx.restore();
    };

    const render = (time: number) => {
      frame = time;
      ctx.clearRect(0, 0, width, height);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -30 || n.x > width + 30) n.vx *= -1;
        if (n.y < -30 || n.y > height + 30) n.vy *= -1;

        if (pointer.active) {
          const px = pointer.x * width;
          const py = pointer.y * height;
          const dx = n.x - px;
          const dy = n.y - py;
          const d = Math.hypot(dx, dy);
          if (d < 180 && d > 1) {
            n.x += (dx / d) * 0.08;
            n.y += (dy / d) * 0.08;
          }
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < 155) {
            const alpha = (1 - d / 155) * 0.18;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(248,250,252,${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      nodes.forEach((n, i) => {
        const glow = 5 + Math.sin(time * 0.001 + i) * 2;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + glow, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(120,210,255,.035)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(248,250,252,.72)";
        ctx.fill();
      });

      packets.forEach((p, i) => {
        const a = nodes[p.a];
        const b = nodes[p.b];
        if (!a || !b) return;
        p.t = (p.t + p.speed) % 1;
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        ctx.beginPath();
        ctx.arc(x, y, 2.1 + (i % 3) * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(226,176,42,.95)";
        ctx.shadowBlur = 14;
        ctx.shadowColor = "rgba(226,176,42,.75)";
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      const badges: Array<[number, number, string, number]> = [
        [width * 0.18, height * 0.25, "↗", 0],
        [width * 0.72, height * 0.20, "✓", 1],
        [width * 0.82, height * 0.62, "◎", 2],
        [width * 0.30, height * 0.72, "✉", 3],
      ];
      badges.forEach(([x, y, label, phase]) => drawBadge(x, y, label, phase));

      raf = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="plexus-canvas" />;
}
