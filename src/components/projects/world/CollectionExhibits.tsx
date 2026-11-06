"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { apparel, decks } from "./content";
import { MediaFigure } from "./WorldExhibits";
import styles from "./WorldShowcase.module.css";

const deckStories: Record<string, string> = {
  "westcose-collage-never-nothing": "A cut-and-paste skate graphic: torn paper, bold marks, and the Never Nothing attitude. Designed to read as a complete composition along the board.",
  "westcose-dead-coast-red-sunset": "The Red Sunset artwork brings a warmer side of the coast to the collection. A separate graphic with its own rhythm and palette.",
  "westcose-motel-sunset": "Motel Sunset takes the world’s roadside character onto a deck. The same coastal identity, expressed through a different piece of artwork.",
  "dead-coast-seagull-never-nothing": "The seagull gets its own Never Nothing edition. A character-led graphic from the Dead Coast side of the collection.",
  "dead-coast-topographic-map": "A map-inspired composition that treats the board as a small piece of the world. Part of the Dead Coast graphic collection.",
  "dead-coast-mascot-classic": "The classic Dead Coast mascot, given the full length of the board. An immediately recognizable identity piece.",
  "westcose-designs-lighthouse-wave": "The lighthouse and wave return as a WestCose Designs deck. Environmental identity and wearable artwork share the same visual language.",
  "dead-coast-high-tide": "High Tide belongs to the Dead Coast collection. Its artwork is prepared specifically for the underside of the skateboard.",
  "dead-coast-keep-out": "Keep Out brings the attitude of Dead Coast’s signage into a standalone board graphic.",
  "dead-coast-undertow": "Undertow is another take on the darker side of the coast, with a dedicated print for the board’s underside.",
  "westcose-coastal-misfits": "Coastal Misfits carries the WestCose identity into the skate collection, alongside apparel and environmental graphics.",
  "westcose-fishbone": "Fishbone adds another coastal graphic to the collection. Its composition follows the deck’s long, narrow silhouette.",
};

export function DeckExhibit() {
  const [brand, setBrand] = useState("All");
  const [id, setId] = useState("westcose-collage-never-nothing");
  const visible = decks.filter(item => brand === "All" || item.brand === brand);
  const selected = decks.find(item => item.id === id)!;
  const index = visible.findIndex(item => item.id === id);
  function filter(next: string) {
    setBrand(next);
    if (next !== "All" && selected.brand !== next) setId(decks.find(item => item.brand === next)!.id);
  }
  return <div id="deck-collection" className={styles.deckCollection} data-world-decks>
    <header className={styles.collectionHeader}><div><span className={styles.eyebrow}>WESTCOSE / DEAD COAST</span><h3>Art under your feet.</h3></div><span>{decks.length} original deck graphics</span></header>
    <div className={styles.deckStage}>
      <div className={styles.deckBoard}><MediaFigure item={{ ...selected.artwork, title: `${selected.name} deck`, alt: `${selected.name} deck artwork`, caption: "Original catalog artwork. Select a board below to explore." }} /></div>
      <div className={styles.deckDescription} aria-live="polite">
        <span className={styles.eyebrow}>{selected.brand} / DECK COLLECTION</span>
        <h4>{selected.name}</h4><p>{deckStories[selected.id]}</p>
        <div className={styles.deckNav}><button type="button" aria-label="Previous deck" onClick={() => setId(visible[(index - 1 + visible.length) % visible.length].id)}><ArrowLeft size={22} /></button><span>{String(index + 1).padStart(2, "0")} / {String(visible.length).padStart(2, "0")}</span><button type="button" aria-label="Next deck" onClick={() => setId(visible[(index + 1) % visible.length].id)}><ArrowRight size={22} /></button></div>
        <p className={styles.exhibitNote}>Artwork from the actual game catalog. Choosing a deck here previews its graphic; it doesn’t change a game save.</p>
      </div>
    </div>
    <div className={styles.deckFilters}><span>Find your graphic</span><div className={styles.choices} role="group" aria-label="Deck brands">{["All", "WestCose", "Dead Coast"].map(name => <button key={name} type="button" aria-pressed={brand === name} onClick={() => filter(name)}>{name}</button>)}</div></div>
    <fieldset className={styles.deckRack}><legend className="sr-only">Choose a deck</legend>{visible.map(item => <label key={item.id} data-selected={selected.id === item.id}>
      <input type="radio" name="showcase-decks" checked={selected.id === item.id} onChange={() => setId(item.id)} value={item.id} />
      <Image src={item.artwork.src} width={item.artwork.width} height={item.artwork.height} alt="" sizes="(max-width: 520px) 90px, 120px" loading="lazy" /><span>{item.name}</span>
    </label>)}</fieldset>
  </div>;
}

export function LoadoutExhibit() {
  const [category, setCategory] = useState("WestCose");
  const [shirtId, setShirtId] = useState("westcose-social-club");
  const [side, setSide] = useState<"front" | "back">("back");
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const shirt = apparel.find(item => item.id === shirtId)!;
  const image = shirt[side];
  function select(id: string) { setShirtId(id); setFailed(false); setRetry(0); }
  return <div className={styles.loadout} data-world-loadout>
    <header className={styles.collectionHeader}><div><span className={styles.eyebrow}>THE APPAREL COLLECTION</span><strong>Original prints. Front to back.</strong></div><span>{apparel.length} designs</span></header>
    <div className={styles.loadoutBody}>
      <div className={styles.fitStage}>
        {failed ? <div className={styles.previewError} role="status"><p>This preview could not load.</p><button type="button" className={styles.action} onClick={() => { setFailed(false); setRetry(retry + 1); }}>Retry preview</button></div> : <Image key={`${image.src}-${retry}`} src={`${image.src}${retry ? `?retry=${retry}` : ""}`} unoptimized={retry > 0} width={image.width} height={image.height} alt={`${shirt.name}, ${side} view on the actual game character`} sizes="(max-width: 767px) 85vw, 440px" onError={() => setFailed(true)} />}
        <div role="group" aria-label="Shirt view" className={styles.fitViews}>{(["front", "back"] as const).map(value => <button key={value} type="button" aria-pressed={side === value} onClick={() => { setSide(value); setFailed(false); }}>{value === "front" ? "Front" : "Back"}</button>)}</div>
        <div className={styles.fitCaption} aria-live="polite"><strong>{shirt.name}</strong><span>{shirt.detail}</span></div>
      </div>
      <div className={styles.inventory}>
        <div className={styles.choices} role="group" aria-label="Apparel categories">{["WestCose", "Dead Coast", "Perks"].map(name => <button key={name} type="button" aria-pressed={category === name} onClick={() => { setCategory(name); select(apparel.find(item => item.category === name)!.id); }}>{name}</button>)}</div>
        <fieldset className={styles.inventoryGrid}><legend className="sr-only">Choose a shirt</legend>{apparel.filter(item => item.category === category).map(item => <label key={item.id} className={styles.inventoryItem} data-selected={shirtId === item.id}>
          <input type="radio" name="showcase-apparel" value={item.id} checked={shirtId === item.id} onChange={() => select(item.id)} />
          <Image src={item.artwork.src} width={item.artwork.width} height={item.artwork.height} sizes="150px" alt="" loading="lazy" /><span>{item.name}</span>
        </label>)}</fieldset>
      </div>
    </div>
    <p className={styles.exhibitNote}>Actual character previews and original print artwork. Equipping and saving happen in the game.</p>
  </div>;
}
