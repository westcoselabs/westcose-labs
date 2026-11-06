"use client";

import Image from "next/image";
import { createContext, lazy, Suspense, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, Cube, IconContext, MagnifyingGlassPlus, Play, X } from "@phosphor-icons/react";
import { models, type WorldMedia, type WorldModel, type WorldVideo } from "./content";
import styles from "./WorldShowcase.module.css";

const ModelViewer = lazy(() => import("./ModelViewer"));
type Exhibit = ({ kind: "image"; media: WorldMedia } | { kind: "video"; video: WorldVideo } | { kind: "model"; model: WorldModel }) & { opener: HTMLElement };
const ExhibitContext = createContext<((exhibit: Exhibit) => void) | null>(null);
function useExhibit() {
  const open = useContext(ExhibitContext);
  if (!open) throw new Error("World exhibits need their provider");
  return open;
}

export function WorldExhibits({ children }: { children: ReactNode }) {
  const [exhibit, setExhibit] = useState<Exhibit | null>(null);
  return <IconContext.Provider value={{ "aria-hidden": true }}><ExhibitContext.Provider value={setExhibit}>
    {children}
    {exhibit && <ExhibitDialog exhibit={exhibit} onClose={() => setExhibit(null)} />}
  </ExhibitContext.Provider></IconContext.Provider>;
}

function ExhibitDialog({ exhibit, onClose }: { exhibit: Exhibit; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const opener = exhibit.opener;
  const title = exhibit.kind === "image" ? exhibit.media.title : exhibit.kind === "video" ? exhibit.video.title : exhibit.model.title;
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const element = ref.current;
    const video = element?.querySelector("video");
    element?.showModal();
    return () => { video?.pause(); element?.close(); document.body.style.overflow = previousOverflow; opener.focus({ preventScroll: true }); };
  }, [opener]);
  return createPortal(<dialog ref={ref} className={`${styles.theme} ${styles.dialog}`} aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }}
    onKeyDown={event => {
      if (event.key !== "Tab" || event.target instanceof HTMLVideoElement) return;
      const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), video[controls], [tabindex="0"]')).filter(node => node.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}>
    <header className={styles.dialogHeader}>
      <h2 id={titleId}>{title}</h2>
      <button type="button" onClick={onClose} autoFocus aria-label="Close exhibit"><X size={22} /></button>
    </header>
    {exhibit.kind === "image" ? <figure className={styles.enlarged}>
      <Image src={exhibit.media.src} width={exhibit.media.width} height={exhibit.media.height} alt={exhibit.media.alt} sizes="95vw" />
      <figcaption>{exhibit.media.caption}</figcaption>
    </figure> : exhibit.kind === "video" ? <div className={styles.video}>
      <video controls playsInline preload="metadata" width={exhibit.video.width} height={exhibit.video.height} poster={exhibit.video.poster.src} aria-label={exhibit.video.title}>
        <source src={exhibit.video.src} type="video/webm" />
        <source src={exhibit.video.fallback} type="video/mp4" />
        Your browser cannot play this video.
      </video>
      <p>{exhibit.video.description}</p>
    </div> : <Suspense fallback={<div className={styles.modelLoading} role="status">Preparing the 3D inspector…</div>}>
      <ModelViewer model={exhibit.model} />
    </Suspense>}
  </dialog>, document.body);
}

export function MediaFigure({ item, className = "", eager = false }: { item: WorldMedia; className?: string; eager?: boolean }) {
  const open = useExhibit();
  return <figure className={`${styles.figure} ${className}`}>
    <button type="button" className={styles.imageButton} onClick={event => open({ kind: "image", media: item, opener: event.currentTarget })} aria-label={`Enlarge ${item.title}`}>
      <Image src={item.src} width={item.width} height={item.height} alt={item.alt} sizes="(max-width: 767px) 92vw, 850px" loading={eager ? "eager" : "lazy"} />
    </button>
    <figcaption><span>{item.caption}</span><button type="button" onClick={event => open({ kind: "image", media: item, opener: event.currentTarget })} aria-label={`Enlarge ${item.title}`}><MagnifyingGlassPlus size={19} /></button></figcaption>
  </figure>;
}

export function VideoButton({ video, label }: { video: WorldVideo; label: string }) {
  const open = useExhibit();
  return <button type="button" className={styles.action} onClick={event => open({ kind: "video", video, opener: event.currentTarget })}><Play size={18} weight="fill" />{label}</button>;
}

export function ExhibitGallery({ items, label, contain = false }: { items: readonly WorldMedia[]; label: string; contain?: boolean }) {
  const [index, setIndex] = useState(0);
  const selected = items[index];
  return <div className={styles.gallery} data-world-gallery={label}>
    <div className={styles.choices} role="group" aria-label={label}>
      {items.map((item, i) => <button type="button" key={item.title} aria-pressed={index === i} onClick={() => setIndex(i)}>{item.title}</button>)}
    </div>
    <div className={contain ? styles.containGallery : undefined}>
      <MediaFigure key={selected.src} item={selected} />
    </div>
  </div>;
}

export function ModelExhibits() {
  const open = useExhibit();
  return <div className={styles.modelChoices}>
    {models.map(model => <button key={model.id} type="button" onClick={event => open({ kind: "model", model, opener: event.currentTarget })} aria-label={`Inspect ${model.title} in 3D`}>
      <Image src={model.poster.src} width={model.poster.width} height={model.poster.height} alt={model.poster.alt} sizes="(max-width: 767px) 90vw, 400px" />
      <span><Cube size={22} /><strong>{model.title}</strong><ArrowUpRight size={20} /></span>
      <small>Inspect in 3D</small>
    </button>)}
  </div>;
}

