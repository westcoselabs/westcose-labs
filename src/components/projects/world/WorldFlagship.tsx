import Image from "next/image";
import Link from "next/link";
import { worldDisplay } from "./font";
import { promotional } from "./content";
import styles from "./WorldShowcase.module.css";

export function WorldFlagship() {
  return <section className={`${styles.theme} ${styles.flagship} ${worldDisplay.variable}`} aria-label="Flagship project" data-project-card="westcose-world" data-world-flagship>
    <div className={styles.flagshipInner}>
      <div className={styles.flagshipCopy}>
        <p className={styles.eyebrow}>THE FLAGSHIP / DESIGN + ENGINEERING</p>
        <h2><Link href="/projects/westcose-world">WestCose <span>World.</span></Link></h2>
        <p>A whole coast, built for the browser. Original artwork, a playable world, and the tools behind it.</p>
        <Link className={styles.action} href="/projects/westcose-world" aria-label="Explore WestCose World">Explore project <span aria-hidden="true">↗</span></Link>
      </div>
      <Link className={styles.flagshipArt} href="/projects/westcose-world" aria-label="Explore WestCose World from the project artwork">
        <Image src={promotional.coast.src} width={promotional.coast.width} height={promotional.coast.height} alt={promotional.coast.alt} sizes="(max-width: 650px) 100vw, 1100px" loading="eager" fetchPriority="high" />
        <span className={styles.artLabel}>Promotional artwork · AI art direction</span>
      </Link>
    </div>
    <div className={styles.flagshipFoot}><span>Next.js + Three.js</span><span>Art / Gameplay / Development labs / World Builder</span></div>
  </section>;
}
