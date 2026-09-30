"use client";

import { useEffect, useRef } from "react";
import { createCreatureSprite, CREATURE_KINDS, CREATURE_BASELINE, CREATURE_SPRITE_SIZE } from "./creature-art";
import type { Outbreak } from "./PersonalityProvider";
import styles from "./Personality.module.css";

type Point = { x: number; y: number };
type Surface = {
  node: HTMLElement | null;
  left: number;
  right: number;
  top: number;
  bottom: number;
  dock: boolean;
  window: boolean;
};
type Creature = {
  kind: number;
  x: number;
  y: number;
  from: Point;
  to: Point;
  elapsed: number;
  duration: number;
  mode: "run" | "jump" | "climb" | "stare" | "hide" | "fall" | "escape";
  facing: number;
  size: number;
  escape: boolean;
  exit?: "edge" | "recycle" | "behind" | "dock";
  targetSurface?: Surface;
  standingOn?: Surface;
  climbTarget?: { node: HTMLElement; side: "left" | "right" };
};
const SPEED = [190, 65, 130, 95, 40, 155, 80, 55];
const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

export default function CreatureField({
  outbreak,
  reducedMotion,
}: {
  outbreak: Outbreak;
  reducedMotion: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(outbreak.phase);
  useEffect(() => {
    phaseRef.current = outbreak.phase;
  }, [outbreak.phase]);
  const {
    id,
    origin: { x: originX, y: originY },
  } = outbreak;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const sprites = Array.from({ length: CREATURE_KINDS.length }, (_, kind) => [
      createCreatureSprite(kind, 0),
      createCreatureSprite(kind, 1),
    ]);
    let width = window.innerWidth,
      height = window.innerHeight;
    let surfaces: Surface[] = [],
      windows: Surface[] = [];
    let frame = 0,
      last = 0,
      scanAt = 0,
      disposed = false;
    const mobile = width < 768;
    canvas.dataset.creatureCount = String(mobile ? 8 : 13);
    const creatures: Creature[] = Array.from(
      { length: mobile ? 8 : 13 },
      (_, i) => {
        const x = clamp(originX + ((i % 3) - 1) * 12, 24, width - 24);
        const y = clamp(originY, 48, height - 20);
        return {
          kind: i % CREATURE_KINDS.length,
          x,
          y,
          from: { x, y },
          to: { x, y },
          elapsed: 0,
          duration: 0.1 + i * 0.08,
          mode: "stare",
          facing: i % 2 ? 1 : -1,
          size: mobile ? 68 + (i % 3) * 6 : 144 + (i % 3) * 12,
          escape: false,
        };
      },
    );

    const scanSurfaces = () => {
      const nodes = document.querySelectorAll<HTMLElement>(
        '[data-desktop-window] > section, [aria-label="Desktop taskbar"], [aria-label="Pocket Dock"], [data-app-id], [data-egg-surface], [data-shell-panel="pocket"] [data-surface], [data-shell-panel="pocket"] article',
      );
      surfaces = [];
      nodes.forEach((node) => {
        if (node.closest("[hidden], [inert]")) return;
        const r = node.getBoundingClientRect();
        if (
          r.width < 25 ||
          r.height < 15 ||
          r.right < 0 ||
          r.left > width ||
          r.top < 24 ||
          r.top > height - 12
        )
          return;
        surfaces.push({
          node,
          left: clamp(r.left, 12, width - 12),
          right: clamp(r.right, 12, width - 12),
          top: r.top,
          bottom: r.bottom,
          dock: /taskbar|dock/i.test(node.getAttribute("aria-label") ?? ""),
          window:
            node.parentElement?.hasAttribute("data-desktop-window") ?? false,
        });
      });
      windows = surfaces.filter((surface) => surface.window);
      surfaces.push({
        node: null,
        left: 16,
        right: width - 16,
        top: height - 10,
        bottom: height,
        dock: false,
        window: false,
      });
      // Keep feet attached when a real window moves. If that window closes (or
      // Pocket changes pages), let its residents fall instead of walking on air.
      creatures.forEach((creature) => {
        if (creature.escape) return;
        const previous = creature.standingOn ?? creature.targetSurface;
        if (!previous) return;
        const current = surfaces.find((surface) => surface.node === previous.node);
        if (!current) {
          creature.climbTarget = undefined;
          setDestination(
            creature,
            { x: creature.x, y: height - 10 },
            "fall",
            0.9,
          );
          return;
        }
        const dx = current.left - previous.left;
        const dy = current.top - previous.top;
        creature.to.x = clamp(creature.to.x + dx, current.left, current.right);
        creature.to.y += dy;
        if (creature.standingOn) {
          creature.x += dx;
          creature.y += dy;
          creature.from.x += dx;
          creature.from.y += dy;
          creature.standingOn = current;
        }
        creature.targetSurface = current;
      });
    };
    const setDestination = (
      creature: Creature,
      to: Point,
      mode: Creature["mode"],
      duration?: number,
      surface?: Surface,
    ) => {
      if (mode !== "stare") {
        creature.standingOn =
          mode === "climb" ||
          (mode === "run" && surface?.node === creature.standingOn?.node)
            ? surface
            : undefined;
      }
      creature.targetSurface = surface ?? creature.standingOn;
      creature.from = { x: creature.x, y: creature.y };
      creature.to = to;
      creature.mode = mode;
      creature.elapsed = 0;
      creature.duration =
        duration ??
        Math.max(
          0.45,
          Math.hypot(to.x - creature.x, to.y - creature.y) /
            SPEED[creature.kind],
        );
      if (Math.abs(to.x - creature.x) > 2)
        creature.facing = to.x > creature.x ? 1 : -1;
      if (mode === "climb" && surface)
        creature.facing = to.x === surface.left ? -1 : 1;
    };
    const pick = (creature: Creature, i: number) => {
      const climbTarget = creature.climbTarget;
      creature.climbTarget = undefined;
      if (climbTarget) {
        const surface = surfaces.find((item) => item.node === climbTarget.node);
        if (surface) {
          setDestination(
            creature,
            { x: surface[climbTarget.side], y: surface.top },
            "climb",
            undefined,
            surface,
          );
          return;
        }
      }
      const roll = Math.random();
      if (roll < 0.16) {
        setDestination(
          creature,
          { x: creature.x, y: creature.y },
          "stare",
          1 + Math.random() * 2.4,
        );
        return;
      }
      if (creature.kind === 4 && roll < 0.65) {
        const leader = creatures[(i + creatures.length - 1) % creatures.length];
        setDestination(
          creature,
          {
            x: clamp(leader.x - 36, 20, width - 20),
            y: clamp(leader.y, 45, height - 10),
          },
          "run",
        );
        return;
      }
      if (creature.kind === 2 && roll < 0.4) {
        setDestination(
          creature,
          {
            x: clamp(
              creature.x - creature.facing * (35 + Math.random() * 110),
              22,
              width - 22,
            ),
            y: creature.y,
          },
          "run",
          0.55,
        );
        return;
      }
      const reachable = surfaces.filter(surface => surface.top >= creature.size * 0.9);
      const favorites = reachable.filter((surface) =>
        creature.kind === 3
          ? surface.dock
          : creature.kind === 1
            ? surface.window
            : true,
      );
      const pool = favorites.length ? favorites : reachable.length ? reachable : surfaces;
      const surface = pool[Math.floor(Math.random() * pool.length)];
      const x = clamp(
        surface.left + Math.random() * (surface.right - surface.left),
        creature.size / 2,
        width - creature.size / 2,
      );
      if (
        creature.kind === 1 &&
        !surface.dock &&
        surface.bottom - surface.top > 50 &&
        roll < 0.75
      ) {
        const side =
          Math.abs(creature.x - surface.left) <
          Math.abs(creature.x - surface.right)
            ? "left"
            : "right";
        const edge = surface[side];
        if (Math.abs(creature.x - edge) > 12) {
          if (surface.node) creature.climbTarget = { node: surface.node, side };
          setDestination(
            creature,
            { x: edge, y: Math.min(surface.bottom - 25, height - 25) },
            "jump",
            1.4,
            surface,
          );
        } else
          setDestination(
            creature,
            { x: edge, y: surface.top },
            "climb",
            undefined,
            surface,
          );
      } else if (roll > 0.85 && surface.window) {
        setDestination(creature, { x, y: surface.top + 65 }, "hide", 1.2);
      } else if (roll > 0.72) {
        setDestination(creature, { x, y: height - 10 }, "fall", 1.4);
      } else {
        const jump = Math.abs(surface.top - creature.y) > 25;
        setDestination(
          creature,
          { x, y: surface.top },
          jump ? "jump" : "run",
          jump ? 0.8 + Math.random() * 0.7 : undefined,
          surface,
        );
      }
    };
    const paint = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      creatures.forEach((creature, i) => {
        ctx.save();
        // A hiding creature is occluded by the real window rectangle, not a fake backdrop.
        if (creature.mode === "hide" || creature.exit === "behind") {
          windows.forEach((r) => {
            ctx.beginPath();
            ctx.rect(0, 0, width, height);
            ctx.rect(r.left, r.top, r.right - r.left, r.bottom - r.top);
            ctx.clip("evenodd");
          });
        }
        if (creature.exit === "dock") {
          ctx.beginPath();
          ctx.rect(
            0,
            0,
            width,
            surfaces.find((surface) => surface.dock)?.top ?? height,
          );
          ctx.clip();
        }
        ctx.translate(Math.round(creature.x), Math.round(creature.y));
        if (creature.exit === "recycle") {
          const gone = clamp(
            (creature.elapsed / creature.duration - 0.55) / 0.45,
            0,
            1,
          );
          ctx.globalAlpha = 1 - gone;
          ctx.scale(1 - gone * 0.7, 1 - gone * 0.7);
        }
        if (creature.mode === "climb")
          ctx.rotate((creature.facing * Math.PI) / 2);
        ctx.scale(creature.facing, 1);
        const walkingFrame =
          !reducedMotion && creature.mode !== "stare"
            ? Math.floor(time / (creature.kind === 0 ? 80 : 160) + i) % 2
            : 0;
        ctx.drawImage(
          sprites[creature.kind][walkingFrame],
          -creature.size / 2,
          -creature.size * (CREATURE_BASELINE / CREATURE_SPRITE_SIZE),
          creature.size,
          creature.size,
        );
        ctx.restore();
      });
    };
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;

      scanSurfaces();
      creatures.forEach((creature, i) => {
        creature.size = width < 768 ? 68 + (i % 3) * 6 : 144 + (i % 3) * 12;
        creature.x = clamp(creature.x, creature.size / 2, width - creature.size / 2);
        creature.y = clamp(creature.y, creature.size, height - 10);
        if (reducedMotion) {
          const reachable = surfaces.filter(surface => surface.top >= creature.size * 0.9);
          const surface = (reachable.length ? reachable : surfaces)[i % (reachable.length || surfaces.length)];
          creature.x = clamp(
            surface.left + (surface.right - surface.left) * (((i % 4) + 1) / 5),
            creature.size / 2,
            width - creature.size / 2,
          );
          creature.y = surface.top;
        }
        setDestination(
          creature,
          { x: creature.x, y: creature.y },
          "stare",
          0.2 + i * 0.07,
        );
      });
      if (reducedMotion) paint(0);
    };
    const tick = (time: number) => {
      if (disposed || document.hidden) {
        frame = 0;
        return;
      }
      const dt = last ? Math.min((time - last) / 1000, 0.045) : 0;
      last = time;
      if (time > scanAt) {
        scanSurfaces();
        scanAt = time + 650;
      }
      creatures.forEach((creature, i) => {
        if (phaseRef.current === "escaping" && !creature.escape) {
          creature.escape = true;
          const recycle = Array.from(
            document.querySelectorAll<HTMLElement>(
              '[data-quarantine-origin], button[data-app-id="recycle"], button[data-egg-surface][aria-label^="Open Recycle"]',
            ),
          )
            .filter((node) => !node.closest("[hidden], [inert]"))
            .map((node) => node.getBoundingClientRect())
            .find(
              (rect) =>
                rect.width > 0 &&
                rect.top >= 0 &&
                rect.bottom <= height &&
                rect.left >= 0 &&
                rect.right <= width,
            );
          let to: Point;
          if (i % 4 === 0 && recycle) {
            creature.exit = "recycle";
            to = {
              x: recycle.left + recycle.width / 2,
              y: recycle.top + recycle.height / 2,
            };
          } else if (i % 4 === 1 && windows.length) {
            creature.exit = "behind";
            const shelter = windows[i % windows.length];
            to = { x: shelter.left + 40, y: shelter.top + 80 };
          } else if (i % 4 === 2) {
            creature.exit = "dock";
            to = { x: creature.x + 35, y: height + 100 };
          } else {
            creature.exit = "edge";
            to = { x: i % 2 ? -100 : width + 100, y: creature.y + 30 };
          }
          setDestination(creature, to, "escape", 0.6 + i * 0.04);
        }
        creature.elapsed += dt;
        const progress = Math.min(1, creature.elapsed / creature.duration);
        const t = creature.mode === "fall" ? progress * progress : progress;
        creature.x = creature.from.x + (creature.to.x - creature.from.x) * t;
        creature.y = creature.from.y + (creature.to.y - creature.from.y) * t;
        if (creature.mode === "jump" || creature.mode === "escape")
          creature.y -=
            Math.sin(progress * Math.PI) *
            (creature.mode === "escape" ? 40 : 65);
        if (progress >= 1 && !creature.escape) {
          creature.standingOn = creature.targetSurface;
          pick(creature, i);
        }
      });
      paint(time);
      frame = window.requestAnimationFrame(tick);
    };
    const visibility = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      } else if (!frame && !reducedMotion) {
        last = 0;
        frame = window.requestAnimationFrame(tick);
      }
    };
    resize();
    if (!reducedMotion) frame = window.requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
      ctx.clearRect(0, 0, width, height);
    };
  }, [id, originX, originY, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.creatures}
      aria-hidden="true"
      data-creature-field
      data-outbreak-id={id}
    />
  );
}

