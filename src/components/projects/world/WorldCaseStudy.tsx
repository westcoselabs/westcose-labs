import "server-only";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { chapters, labs, media, videos, weapons } from "./content";
import { worldDisplay } from "./font";
import { ChapterNavigation } from "./ChapterNavigation";
import { ExhibitGallery, MediaFigure, ModelExhibits, VideoButton, WorldExhibits } from "./WorldExhibits";
import { DeckExhibit, LoadoutExhibit } from "./CollectionExhibits";
import { ShopExhibit } from "./ShopExhibit";
import { promotional } from "./content";
import catalog from "./catalog.generated.json";
import styles from "./WorldShowcase.module.css";

function Chapter({ index, title, intro, children }: { index: number; title: string; intro: string; children: ReactNode }) {
  const chapter = chapters[index];
  return <section id={chapter.id} className={styles.chapter} aria-labelledby={`${chapter.id}-title`}>
    <span className={styles.chapterLabel}>{String(index + 1).padStart(2, "0")} / {chapter.label}</span>
    <h2 id={`${chapter.id}-title`} tabIndex={-1}>{title}</h2>
    <p className={styles.chapterIntro}>{intro}</p>
    {children}
  </section>;
}
function Detail({ title, children }: { title: string; children: ReactNode }) {
  return <details className={styles.detail}><summary>{title}</summary>{children}</details>;
}

export function WorldCaseStudy() {
  return <WorldExhibits><article className={`${styles.theme} ${styles.caseStudy} ${worldDisplay.variable}`} data-route-content data-world-case-study>
    <div className={styles.topline}><Link className={styles.back} href="/projects">← Back to Projects</Link></div>
    <header className={styles.intro}>
      <div>
        <p className={styles.eyebrow}>WESTCOSE ORIGINALS / FLAGSHIP PROJECT</p>
        <h1 tabIndex={-1}>WestCose <span>World.</span></h1>
        <p className={styles.lede}>A whole coast, built for the browser. An original world of skate culture, strange places, and things worth discovering.</p>
        <div className={styles.introMeta}><span>Design & engineering</span><span>Active development</span><span>Private source</span></div>
        <div className={styles.actionRow}><a className={styles.action} href="#world">Explore the world ↓</a><a className={styles.heroSecondary} href="#loadout">Discover the collection ↗</a></div>
      </div>
      <figure className={styles.introVisual}>
        <Image src={promotional.coast.src} width={promotional.coast.width} height={promotional.coast.height} alt={promotional.coast.alt} sizes="(max-width: 820px) 100vw, 1200px" loading="eager" fetchPriority="high" />
        <figcaption>Promotional artwork · AI art direction</figcaption>
      </figure>
    </header>
    <div className={styles.stack}><strong>Made with</strong><span>Next.js</span><span>Three.js</span><span>React Three Fiber</span><span>TypeScript</span><span>Blender</span></div>
    <div className={styles.body}>
      <ChapterNavigation chapters={chapters} />
      <div className={styles.chapters}>
        <Chapter index={0} title="A world in the browser" intro="Start with a little planet. Step into a coastal town. Follow a street, find a skate spot, or take the long way to the water.">
          <ExhibitGallery items={[media.explore, media.shopFront]} label="Inside the playable world" />
          <p>WestCose World brings the brand into a place you can inhabit. Walking, skating, fishing, enterable interiors, and survival games share a continuous coastal setting. The town has its own storefronts and artwork; the pier, lighthouse, caves, and industrial backroads give each journey a different character.</p>
          <p>Next.js provides the application and interfaces. React Three Fiber connects React to the scene, while Three.js handles the cameras, geometry, materials, lighting, and animation. TypeScript carries the rules that make those pieces behave like one world.</p>
          <div className={styles.actionRow}><VideoButton video={videos.world} label="Watch the world walkthrough" /></div>
          <Detail title="How movement follows a small planet">
            <p>The player’s up direction comes from the planet’s center. Movement is projected onto the local tangent plane, and the camera follows that changing frame. Authored map coordinates place roads, buildings, and activities on the sphere.</p>
            <p>Terrain height, walkable surfaces, collision, steps, and camera clearance refer to shared world data. A road’s visible shape and the ground under the player therefore come from the same definition. Interiors and activities can take over the camera and input, then hand control back to exploration.</p>
          </Detail>
        </Chapter>

        <Chapter index={1} title="Artwork becomes a world" intro="The visual identity is part of the environment: printed on shirts, fitted to decks, mounted on walls, and built into landmarks.">
          <ExhibitGallery items={[media.art, media.atlas, media.shirt]} label="Artwork transformation" contain />
          <p>Coastal colors, worn signage, hand-drawn graphics, and compact, low-poly forms keep the world recognizably WestCose. The graphics retain their character as they move between a flat print, a wearable texture, and a physical place.</p>
          <ShopExhibit />
          <h3>Two assets, up close</h3>
          <p>Rotate the Dead Coast Pier sign and the Shop building. Switch to wireframe to see the geometry behind their silhouettes.</p>
          <ModelExhibits />
          <Detail title="From a source graphic to a runtime asset">
            <p>Shirt artwork is projected onto the actual torso and baked through its UV triangles. This preserves the chest and back placement without changing the character’s mesh, rig, or animation. Preview renders use the same prepared textures.</p>
            <p>The Pier sign began with original WestCose artwork, translated into a dimensional sign through Higgsfield / Tripo H3.1. Blender work added the supports, fittings, materials, and lamps. The painted runtime version has 32,249 triangles, two materials, and a small seamless paint texture.</p>
            <p>The Shop combines original graphics, architectural composition, and custom geometry with adapted, credited environment assets. Scale, pivots, materials, and texture atlases are prepared for the game. The model inspector uses those actual GLB exports.</p>
          </Detail>
        </Chapter>

        <Chapter index={2} title="Start, pause, and shop" intro="A game’s interface belongs to its world. The same paper, paint, condensed type, and coastal artwork carry through the first frame and every return to the menu.">
          <ExhibitGallery items={[media.start, media.pause, media.loadout]} label="Game interfaces" />
          <h3>The opening broadcast</h3>
          <p>An eight-second broadcast sets the tone with an undead seagull and original artwork. The game loads underneath it. A skip action, reduced-motion preference, or playback failure releases the player into the loading and title sequence.</p>
          <div className={styles.actionRow}><VideoButton video={videos.intro} label="Watch the opening film" /></div>
          <h3>A title screen with a real world behind it</h3>
          <p>The planet remains live behind the title artwork. Condensed menu labels and yellow paper establish the primary action; smaller supporting lines explain the choices. Portrait layouts rearrange the composition for touch. Loading progress follows completed work, then the camera approaches the planet and hands off to the player.</p>
          <h3>Take Five and WestCose Loadout</h3>
          <p>Take Five keeps the moment the player left behind: a captured gameplay frame sits beneath the pause drawer. Loadout uses a larger character preview, separate apparel and deck departments, and an explicit equip action. Browsing and committing a choice are different steps.</p>
          <Detail title="Camera handoffs, pause frames, and focus">
            <p>The title reveal and descent reuse the mounted world, renderer, and camera. The atmosphere changes with the camera mode rather than replacing the whole scene.</p>
            <p>Pausing captures the rendered frame and suspends activity input and continuous world rendering. The drawer remains an ordinary accessible interface. Dialog focus stays with the active interface, Escape returns through the intended state, and closing restores the player’s context.</p>
            <p>The broadcast is a prepared film with a bounded handoff: a late first frame, stall, or playback error does not indefinitely block the game. Sound follows the game’s opt-in preference. The portfolio film is silent.</p>
          </Detail>
        </Chapter>

        <Chapter index={3} title="Clothing and decks" intro="The artwork is wearable. Browse the real collection: 25 shirts across WestCose, Dead Coast, and Perks, plus 12 decks from WestCose and Dead Coast.">
          <DeckExhibit />
          <h3 id="apparel-collection" className={styles.collectionHeading}>Wear the coast.</h3>
          <p>Original front and back prints, shown on the actual game character. Pick a collection, choose a design, and turn it around.</p>
          <LoadoutExhibit />
          <p>Small chest graphics and larger back prints give each shirt a different read from the front and the follow camera. Decks use their own tall compositions, fitted to the board rather than treated as miniature posters. The selectors keep category, selected artwork, and the resulting preview together.</p>
          <Detail title="What happens when a player equips a design">
            <p>The game distinguishes the previewed design from the equipped one. Clothing selection loads the complete texture before replacing the three torso materials together. A superseded request is cancelled or ignored; a failed load keeps the current outfit available for recovery.</p>
            <p>Texture setup preserves the model’s UV orientation, wrapping, and color space. Replaced textures are released only after checking that another material is not still using them. Deck graphics follow their own catalog and material replacement path.</p>
            <p>Equipped choices persist locally in the game. This portfolio exhibit uses independent React state and rendered previews; it does not read or write a visitor’s game save.</p>
          </Detail>
        </Chapter>

        <Chapter index={4} title="Zombies: two different places" intro="The Grotto and Reclamation Center share a combat foundation. Their spaces, progression, and environmental threats make them feel like different survival games.">
          <h3>The Grotto / Black Tide</h3>
          <MediaFigure item={media.grotto} />
          <p>A sea cave turns into a compact survival arena. Every fifth round brings Black Tide: a warning, rising water, a flooded fight, and a drain phase. The dry ledge becomes a tactical refuge. Water is part of the rules, with the visible flood and damage boundary driven by the same definition.</p>
          <h3>Reclamation Center / the night shift</h3>
          <p>The facility is a larger progression space. Gates control the route, power changes what works, and perks, equipment, and furnace upgrades give earned points a purpose. Barricades, machinery, industrial rooms, and connecting yards create decisions about where to hold and when to move.</p>
          <Detail title="The clock-in sequence in the game"><MediaFigure item={media.clock} /></Detail>
          <p>The story begins with workplace routine: arrive for the night shift, clock in, and sit through the safety film. Instructions, signs, equipment, and the layout of the facility carry the story into play. The drums found in the Grotto came from Reclamation, connecting the coast’s two survival spaces through the world’s lore.</p>
          <Detail title="Shared combat, map-specific rules">
            <p>A shared TypeScript session owns rounds, enemies, damage, weapons, and interactions. Map adapters answer questions about floors, visibility, routes, collision, and usable objects. The Grotto adds flood rules; Reclamation adds facility progression, power, and Gary.</p>
            <p>Those same systems can run in development labs. A lab can put a player, target, or encounter into a known state without rebuilding the rules as a separate demo. Planned connective spaces in the lore are kept distinct from currently traversable routes.</p>
          </Detail>
        </Chapter>

        <Chapter index={5} title="Weapons and Gary" intro="Combat is a conversation between simulation and presentation: a shot has to land at the right time, feel readable, and obey the same rules the player can see.">
          <h3 className={styles.collectionHeading}>The arsenal, up close.</h3>
          <p>Recognizable silhouettes meet original coastal oddities. Explore the AK-47, MP5, and two WestCose wonder weapons through studio renders of the current game models.</p>
          <div className={styles.weaponGrid} data-world-weapons>{weapons.map(weapon => <section key={weapon.id} aria-labelledby={`weapon-${weapon.id}`}>
            <MediaFigure item={weapon.image} />
            <div className={styles.weaponCopy}><span className={styles.eyebrow}>{weapon.family}</span><h4 id={`weapon-${weapon.id}`}>{weapon.name}</h4><p>{weapon.description}</p>{weapon.upgrade && <p className={styles.weaponUpgrade}>Furnace upgrade <strong>{weapon.upgrade}</strong></p>}</div>
          </section>)}</div>
          <p>Aim transitions, recoil, ammunition, and reload timing live alongside authored first-person animation. Equipment and upgrades extend the same system rather than bypassing it.</p>
          <Detail title="Aiming, reloads, markers, and hit detection">
            <p>Weapon state tracks actions and their timing. Animation markers coordinate visible events with ammunition changes and effects; empty and partial reloads can follow different paths. Recoil and aiming affect the view, while the shot is resolved by the combat simulation.</p>
            <p>Hit testing checks target regions and environmental occlusion. Presentation consumes the resulting events for muzzle flashes, impacts, sound, and reactions. The Arsenal and Damage Range make framing, action timing, and damage repeatable to inspect.</p>
          </Detail>
          <h3>Meet Gary. He works here.</h3>
          <MediaFigure item={promotional.gary} />
          <p>A high-visibility shirt, name badge, oversized silhouette, and pipe wrench make Gary part of the facility’s workforce. His design adapts the civilian zombie into a character with a very different presence.</p>
          <p>He arrives from the sludge in the first round, outside the ordinary zombie quota. His entrance lets the sludge stir, the body climb into view, and the wrench meet his palm before pursuit begins. Calm Gary is slow and readable. Provoking him brings a scream, faster pursuit, running attacks, and a ground slam.</p>
          <Detail title="Gary’s current model and silhouette"><MediaFigure item={media.gary} /></Detail>
          <Detail title="Gary’s current behavior, from arrival to return">
            <p>The current director schedules his first arrival six seconds into the session. Dedicated states handle emerging, calm pursuit, screaming, rage, swings, slams, staggering, defeat, and sinking. Attacks use their clips’ timing markers; hit spacing and a grace period after the scream prevent unavoidable chains.</p>
            <p>From round six, an enraged Gary can accelerate nearby zombies. Beating him sends him back toward the sludge; he sinks and stays away for two rounds before returning. The map provides reachable sludge points and navigation, while the director owns his state and timing.</p>
          </Detail>
        </Chapter>

        <Chapter index={6} title="Development labs and World Builder" intro="The project includes the tools needed to make it. Purpose-built Next.js interfaces and Three.js scenes turn difficult visual problems into things that can be inspected, repeated, and improved.">
          <h3>A lab for each question</h3>
          <ExhibitGallery items={labs} label="Development labs" />
          <p>Arsenal isolates weapons and their actions. Damage Range checks hit regions and distance. Zombie Animation exposes movement and reactions. Barricades exercises tearing and traversal. Effects & Audio connects feedback to events. Reclamation reproduces facility systems and encounters. Hound Look compares enemy presentation, and the Skater lab keeps the character, board, and animation in view together.</p>
          <p>These are working development interfaces, with the game’s actual assets and shared systems. They shorten the loop between changing a rule, seeing the result, and checking the same situation again.</p>
          <h3>World Builder</h3>
          <ExhibitGallery items={[media.builder, media.builderPlacement, media.builderWalkthrough, media.builderReview]} label="World Builder workflow" />
          <p>The Builder makes world composition an interactive task. An asset library, scene viewport, and selected-item inspector work together, with separate Free Roam and Reclamation workspaces. Numerical controls sit alongside direct manipulation so a placement can be both intuitive and exact.</p>
          <ol className={styles.process}>
            <li><div><strong>Import and prepare</strong><p>Bring in PNG, JPEG, or WebP artwork, or a self-contained static GLB. Model preparation normalizes size and the base pivot. Compare the original with the prepared result before adding it to the library.</p></div></li>
            <li><div><strong>Place and refine</strong><p>Choose a prop or print, place it on a surface, then move, rotate, or scale it. Use snapping, dimensions, duplicate, lock, and undo/redo. Objects placed on an added support follow that support when it moves.</p></div></li>
            <li><div><strong>Walk through and check</strong><p>Inspect from player height. Review collision shapes and reserved clearances around entrances, interactions, routes, and gameplay machinery. Scene sampling exposes draw calls, triangles, textures, and frame intervals.</p></div></li>
            <li><div><strong>Save, review, and apply</strong><p>Save an immutable named version. Review that exact version and resolve blocking issues before applying it to the local game. Recovery drafts and previous versions preserve a way back.</p></div></li>
          </ol>
          <div className={styles.diagram} aria-label="Builder publication flow">
            <p>BUILDER → GAME</p><ol className={styles.flow}>
              <li><strong>Draft & assets</strong><span>Prepared revisions, placements, transforms, and support relationships.</span></li>
              <li><strong>Saved version & review</strong><span>Surface, asset, collision, and gameplay checks against a specific version.</span></li>
              <li><strong>Applied game layer</strong><span>A compiled manifest and prepared files, included in the next production build.</span></li>
            </ol>
          </div>
          <Detail title="Publication safeguards and recovery">
            <p>Applying a layout updates the local game’s decoration layer; deployment is a separate step. Protected buildings and gameplay machinery stay outside ordinary prop editing. Missing assets, invalid supports, or blocked required clearances prevent application.</p>
            <p>Free Roam and Reclamation use different collision and navigation contracts. Reclamation validates player and enemy occupancy, shots, and representative routes. Free Roam checks movement, camera clearance, support, and overhead limits.</p>
            <p>Saved versions are immutable. Draft recovery is separate, simultaneous changes are reported as conflicts, and failed application preserves the last working output. A production prebuild check verifies the applied files and their dependencies.</p>
          </Detail>
          <p className={styles.exhibitNote}>Labs, Builder, and authoring APIs are local development tools. This case study presents their real captures and workflow; those authoring routes are excluded from normal production.</p>
        </Chapter>

        <Chapter index={7} title="How it works" intro="A clear boundary between the application, simulation, world data, and rendered scene lets the project grow without tying every feature to the main game loop.">
          <div className={styles.diagram} aria-label="World architecture">
            <p>APPLICATION → SIMULATION → PRESENTATION</p><ol className={styles.flow}>
              <li><strong>Next.js + React</strong><span>Routes, menus, Loadout, preferences, labs, and Builder controls.</span></li>
              <li><strong>TypeScript systems</strong><span>Input, movement, combat, progression, map adapters, and persistent choices.</span></li>
              <li><strong>R3F + Three.js</strong><span>Scene composition, cameras, materials, animation, effects, and lighting.</span></li>
            </ol>
          </div>
          <h3>One source of truth for the place</h3>
          <p>World definitions describe the terrain and authored surfaces used by rendering and collision. Activity and map adapters translate those definitions into the questions a simulation needs to ask: where an actor can stand, what a ray hits, or whether an interaction is reachable.</p>
          <h3>Rules first, visible consequences second</h3>
          <p>The combat session does not depend on React or the DOM. It advances state and emits events; the scene turns those events into poses, effects, and audio. Animation playback follows action states and markers, including root motion where an entrance or attack needs physical travel.</p>
          <Detail title="Assets, resource lifetime, and persistence">
            <p>Prepared GLB models, texture atlases, material definitions, and authored animation data enter through focused loaders. Repeated environment props can share prepared assets and be batched into local cells. Replacement and cleanup paths account for shared textures and GPU resources.</p>
            <p>Local preferences and equipment choices are separate from live session state. Builder recovery drafts, immutable saved versions, prepared asset revisions, and applied manifests have distinct responsibilities. The portfolio packages its own selected media, so it does not depend on a neighboring development checkout in production.</p>
          </Detail>
          <Detail title="How the work is validated">
            <p>Repeatable gameplay fixtures and development labs cover behaviors that are difficult to inspect during an ordinary run. Automated checks complement visual review: geometry and collision validation, action-state tests, browser interaction checks, and production validation of applied Builder layouts.</p>
            <p>This case study was mapped with Graphify, then checked against current source. The source snapshot is <code>{catalog.sourceRevision.slice(0, 12)}</code>. New captures show the current title, menus, labs, and Builder; asset and gameplay review captures document their individual development passes.</p>
          </Detail>
          <h3>Credits and current status</h3>
          <p>WestCose World is an actively developed project. The playable systems and authoring tools shown here are implemented; art, performance, gameplay balance, and release preparation continue. The repository is private.</p>
          <ul className={styles.credits}>
            <li><strong>WestCose:</strong> world concept, brand artwork, clothing and deck graphics, interface design, environment composition, game systems, labs, and Builder integration.</li>
            <li><strong>Generated and assembled work:</strong> the Pier sign uses Higgsfield / Tripo H3.1 with Blender assembly and refinement. The opening film uses GPT Image 2.5 imagery and Kling 3.0 Pro footage, composed with layered animation; its source production also uses Seed Audio TTS.</li>
            <li><strong>Shop environment:</strong> adapted <a href="https://valsekamerplant.itch.io/psx-style-urban-stacked-pack">Urban</a>, <a href="https://valsekamerplant.itch.io/psx-style-opulent-office">Office</a>, and <a href="https://valsekamerplant.itch.io/psx-style-house-plants-and-pots">Plants</a> by valsekamerplant (CC0); <a href="https://heyheythere.itch.io/psx-building-kit-free">PSX Building Kit Free</a> by heyheythere (<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>), with modified scale, pivots, composition, materials, and atlases; selected <a href="https://elegantcrow.itch.io/retro-psx-nature-pack">Elegant Crow</a> geometry with original replacement imagery (CC0); and <a href="https://screamingbrainstudios.itch.io/photorealistic-texture-pack">Screaming Brain Studios</a> surface textures (CC0). No endorsement implied.</li>
            <li><strong>Civilian zombie and Gary:</strong> adapted from <a href="https://opengameart.org/content/zombie">“zombie” by Pixelhouse</a> (<a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>). WestCose changed clothing, anatomy, materials, and rigging; Gary adds original hi-vis clothing, badge, hair, and wrench, with <a href="https://opengameart.org/content/fps-arms-rigged-only">para / MakeHuman hands</a> (CC0). No endorsement implied.</li>
            <li><strong>Weapon models:</strong> the AK-47 studio render shows <a href="https://sketchfab.com/3d-models/ak-47-assault-rifle-b59e17423c06416bb92b8e31d9ad5e8f">MaX3Dd’s AK 47 Assault Rifle</a> (Sketchfab Standard), used as the game’s wall model. The separate first-person AKM uses <a href="https://sketchfab.com/3d-models/akm-reload-animation-5e5b027e946c45658eea4342876645f8">Vlasov Daniil’s model and reload animation</a> (CC BY 4.0). The MP5 model derives from <a href="https://sketchfab.com/3d-models/mp5sd-a79689d37bb547c4a1ab6628f60dd05f">TastyTony’s MP5SD</a> (CC BY 4.0), with WestCose material and game adaptations; first-person studies also use <a href="https://sketchfab.com/3d-models/fps-animations-lowpoly-mp5-568f00dd76944baaa5eae1a1cc871423">Cransh’s animation</a> and para / MakeHuman hands. Riptide and The Blowhole use original WestCose geometry, materials, and paint atlases. Studio lighting is for this portfolio; the model geometry and materials are unchanged. No endorsement implied.</li>
            <li><strong>Hounds:</strong> the lab compares adaptations of <a href="https://sketchfab.com/3d-models/hell-hound-110ba0ff4c8c414988c454749e52f3be">LisbetBrioso’s Hell Hound</a> and <a href="https://sketchfab.com/3d-models/arctic-wolf-psx-0bd6a72972e74576829e050201564ebf">vinrax’s Arctic wolf PSX</a> (CC BY 4.0), with WestCose repainting, rig fitting, and effects.</li>
            <li><strong>Prototype reference dependencies:</strong> the skater derives from Tony Hawk’s Underground 2 (Neversoft / Activision). Combat research and adapted animation include Call of Duty: Black Ops (Treyarch / Activision) data. That proprietary data is separate from the licensed meshes above. These studies are shown as rendered captures; their raw character and weapon models are not included in this portfolio.</li>
            <li><strong>Typography:</strong> Barlow Condensed by Jeremy Tribby (SIL Open Font License), Manrope, and IBM Plex Mono.</li>
          </ul>
          <p>There is also a separate <Link href="/experiments/westcose-world">interactive planet experiment</Link> in the portfolio, exploring the spherical scene on its own.</p>
        </Chapter>
      </div>
    </div>
    <footer className={styles.closing}><div><strong>A world of ideas, made tangible.</strong><p>From the first graphic to the tools behind the game.</p></div><Link className={styles.action} href="/projects">Back to Projects ↗</Link></footer>
  </article></WorldExhibits>;
}
