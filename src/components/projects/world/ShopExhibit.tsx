import Image from "next/image";
import { apparel, decks, media, promotional } from "./content";
import { ExhibitGallery } from "./WorldExhibits";
import styles from "./WorldShowcase.module.css";

export function ShopExhibit() {
  const shirt = apparel.find(item => item.id === "westcose-social-club")!;
  const deck = decks.find(item => item.id === "westcose-collage-never-nothing")!;
  return <section id="shop" className={styles.shopExhibit} aria-labelledby="shop-title" data-world-shop>
    <header className={styles.shopHeader}>
      <span className={styles.eyebrow}>THE WESTCOSE FLAGSHIP STORE</span>
      <h3 id="shop-title" className={styles.shopHeading}>Step inside WestCose.</h3>
      <p>A place for the artwork to live. From the courtyard to the mural, the store brings the world’s clothing, boards, and coastal identity together.</p>
    </header>
    <ExhibitGallery label="Explore the shop" items={[
      { ...promotional.shop, title: "Art direction" },
      { ...media.shopFront, title: "Storefront" },
      { ...media.shop, title: "In-game interior" },
    ]} />
    <noscript><figure><Image src={media.shopFront.src} width={media.shopFront.width} height={media.shopFront.height} alt={media.shopFront.alt} style={{width:"100%",height:"auto"}} /><figcaption>{media.shopFront.caption}</figcaption></figure><figure><Image src={media.shop.src} width={media.shop.width} height={media.shop.height} alt={media.shop.alt} style={{width:"100%",height:"auto"}} /><figcaption>{media.shop.caption}</figcaption></figure></noscript>
    <div className={styles.shopStory}>
      <div><span className={styles.eyebrow}>FROM WALL TO WARDROBE</span><h4>One identity.<br />A whole collection.</h4>
        <p>The skull-wave mural anchors the room. Sea-green ink, warm sunset colors, brick, and timber connect the architecture to the original prints.</p>
        <p>In the game, Loadout carries that identity into a focused selection flow: browse a department, preview the design, then equip it.</p>
        <a className={styles.shopTextLink} href="#interface">Explore the game interface ↗</a>
      </div>
      <div className={styles.shopCollectionLinks}>
        <a href="#apparel-collection"><div><Image src={shirt.artwork.src} width={shirt.artwork.width} height={shirt.artwork.height} alt="WestCose Social Club original shirt graphic" sizes="180px" /></div><span><strong>Wear the coast</strong><small>25 apparel designs ↗</small></span></a>
        <a href="#deck-collection"><div><Image src={deck.artwork.src} width={deck.artwork.width} height={deck.artwork.height} alt="Collage / Never Nothing original deck graphic" sizes="150px" /></div><span><strong>Pick your deck</strong><small>12 original graphics ↗</small></span></a>
      </div>
    </div>
  </section>;
}
