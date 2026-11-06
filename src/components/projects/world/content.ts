import catalog from "./catalog.generated.json";
import refinement from "./refinement.generated.json";

export type WorldImage = { src: string; width: number; height: number };
export type WorldMedia = WorldImage & { title: string; alt: string; caption: string };
export type WorldChapter = { id: string; label: string; title: string };
export const chapters: readonly WorldChapter[] = [
  { id: "world", label: "The world", title: "A world in the browser" },
  { id: "art", label: "Art & models", title: "Artwork becomes a world" },
  { id: "interface", label: "The interface", title: "An identity you can interact with" },
  { id: "loadout", label: "Clothing & decks", title: "Wear it. Ride it. Make it yours." },
  { id: "outbreak", label: "Zombies", title: "Same coast. Different survival rules." },
  { id: "combat", label: "Weapons & Gary", title: "The details that make combat feel right" },
  { id: "tools", label: "Labs & Builder", title: "Building the tools to build the world" },
  { id: "engineering", label: "How it works", title: "Under the surface" },
];

function exhibit(key: string, title: string, alt: string, caption: string): WorldMedia {
  const item = (refinement.captures as Record<string, WorldImage>)[key] ?? (catalog.media as Record<string, WorldImage>)[key];
  if (!item) throw new Error(`Missing World showcase capture: ${key}`);
  return { ...item, title, alt, caption };
}
export const media = {
  world: exhibit("world", "WestCose World", "A globe view of WestCose World's coastal town, roads, beaches, and wooded headlands", "One continuous planet, with places to explore and activities to discover."),
  explore: exhibit("explore", "At street level", "The current WestCose storefront and its original window graphics at sunset", "Fresh in-game capture: a street-level view of the current storefront, with the HUD hidden."),
  start: exhibit("start", "The start screen", "WestCose World's illustrated title screen with its live 3D planet and start menu", "The title screen uses a live planet, original coastal artwork, and familiar menu actions."),
  intro: exhibit("intro-poster", "The opening broadcast", "A frame from the Dead Coast opening broadcast with original coastal imagery", "A short broadcast introduces the world while the game loads underneath."),
  pause: exhibit("pause", "Take Five", "The Take Five pause drawer over a captured frame of gameplay", "A captured frame keeps the world in view while rendering and activity input pause."),
  loadout: exhibit("loadout", "WestCose Loadout", "The actual Loadout interface with a character preview, apparel selection, and deck artwork", "The game's shop brings apparel, decks, a fit preview, and an explicit equip action into one place."),
  art: exhibit("shirt-art", "Original artwork", "The original WestCose Social Club back graphic", "The original graphic is preserved, with a small chest print and a larger composition on the back."),
  atlas: exhibit("shirt-atlas", "Prepared asset", "The baked shirt texture atlas, with artwork positioned across the character's torso UV panels", "Artwork is projected onto the actual torso, then baked through its UV triangles into a texture atlas."),
  shirt: exhibit("shirt-game", "In game", "A back view rendered from the actual skater model wearing the Social Club shirt", "Only the torso materials change. The print follows the existing character's rig and movement."),
  pier: exhibit("pier-model", "Dead Coast Pier sign", "The assembled Dead Coast Pier entrance sign model, shown at an angle", "Original WestCose artwork translated into a dimensional landmark, then assembled and refined in Blender."),
  pierGame: exhibit("pier-game", "A landmark in place", "The painted Dead Coast Pier gateway installed above the timber pier entrance", "Sea-green enamel, relief lettering, worn paint, and lamps tie the sign to its coastal setting."),
  shop: exhibit("shop", "Inside the Shop", "The current WestCose Shop black feature wall with its updated skull-wave mural and merchandise displays", "Fresh in-game capture of the current shop and mural. Fixed review camera, HUD hidden; no image retouching."),
  shopFront: exhibit("shop-front", "WestCose Shop", "The current exterior and courtyard of the WestCose Shop, including its window graphics", "The current storefront in the game’s sunset lighting. Fixed review camera, HUD hidden."),
  grotto: exhibit("grotto", "The Grotto", "The Grotto survival arena during its Black Tide flooding phase", "Black Tide changes which ground is safe. The warning, flood, damage, and map share the same state."),
  reclamation: exhibit("reclamation", "Reclamation Center", "The Reclamation Center's industrial yard with hazard markings and power restored", "Power opens the facility. Gates, workspaces, machinery, and sightlines shape the survival route."),
  clock: exhibit("clock", "Clocking in", "The Reclamation Center punch clock and night-shift onboarding in the time office", "An ordinary workplace ritual becomes the entry point to an increasingly strange night shift."),
  gary: exhibit("gary", "Meet Gary", "Gary in a high-visibility work shirt carrying his pipe wrench, beside the civilian zombie for scale", "Gary's working model: a larger silhouette, a high-visibility shirt, a name badge, and a very physical wrench."),
  garyGame: exhibit("gary-game", "Gary on the job", "Gary encountered inside the Reclamation Center's industrial environment", "Gary exists outside the ordinary wave quota. His behavior responds to the player and the facility."),
  weapon: exhibit("weapon", "First-person handling", "The MP5 viewmodel and hands framed in a first-person combat test", "Weapon models, hands, sights, and action timing are reviewed together from the player's camera."),
  builder: exhibit("builder", "World Builder", "The actual World Builder with asset library, 3D scene, and selected-item inspector", "A Next.js and Three.js authoring tool with separate Free Roam and Reclamation workspaces."),
  builderPlacement: exhibit("builder-placement", "Placement & transforms", "World Builder focused on a selected wall graphic with its transform and material controls", "Selection connects an object in the scene to its dimensions, mounting, appearance, and inclusion in the game."),
  builderWalkthrough: exhibit("builder-walkthrough", "Walk through", "World Builder's player-height walkthrough mode inside the Reclamation Center", "Check the scene from player height, then return to the editing camera without changing the layout."),
  builderReview: exhibit("builder-review", "Review & apply", "Builder review showing a saved layout version, clearance and route checks, and an apply action", "Review a specific saved version, inspect the checks and changes, then apply it to the local game."),
};

export const labs: readonly WorldMedia[] = [
  exhibit("lab-arsenal", "Arsenal", "The Arsenal development lab showing a weapon and its inspection controls", "Inspect weapon framing, aim alignment, reloads, and upgrades without starting a survival run."),
  exhibit("lab-range", "Damage range", "The Damage Range development lab with target and weapon tuning controls", "Test distance, hit regions, ammunition, and occlusion against repeatable targets."),
  exhibit("lab-zombies", "Zombie animation", "The zombie animation lab with a rendered enemy and playback controls", "Inspect locomotion, attacks, reactions, and animation handoffs in a controlled scene."),
  exhibit("lab-barricades", "Barricades", "The barricade development lab showing a facility window and traversal test", "Exercise the complete interaction: approach, tear boards, climb through, and rejoin pursuit."),
  exhibit("lab-effects", "Effects & audio", "The effects and audio lab used to inspect combat feedback", "Review impact effects and sound alongside the simulation events that trigger them."),
  exhibit("lab-reclamation", "Reclamation", "The Reclamation development lab with facility and survival controls", "Jump to facility systems, inspect progression, and reproduce encounters including Gary."),
  exhibit("lab-hounds", "Hound look", "The Hound Look development lab comparing enemy presentation", "Compare silhouettes, materials, motion, and effects before selecting a production presentation."),
  exhibit("lab-skater", "Skater", "The Skater development lab with the character, skateboard, and animation controls", "Inspect the character and board together, checking poses, movement, and animation continuity."),
];

export type ApparelItem = typeof catalog.apparel[number];
export type DeckItem = typeof catalog.decks[number];
export const apparel: readonly ApparelItem[] = catalog.apparel;
export const decks: readonly DeckItem[] = catalog.decks;

export const promotional = {
  coast: { ...refinement.promotional["coast-key-art-v3"], title: "A coast of your own", alt: "AI-assisted promotional artwork of WestCose’s complete spherical planet, with curved coastal water, town, pier and lighthouse against a deep teal backdrop", caption: "Promotional artwork · AI-assisted art direction based on the game’s spherical world and landmarks." },
  shop: { ...refinement.promotional["shop-art-direction-v2"], title: "Inside WestCose", alt: "AI-assisted shop art-direction render centered on the current black Dead Coast Society mural, with apparel and deck displays", caption: "AI-assisted promotional art direction. Select Storefront or In-game interior to see the current game." },
  gary: { ...refinement.promotional["gary-campaign-v2"], title: "Gary, night shift", alt: "AI-assisted promotional portrait of Gary in his high-visibility work shirt, carrying his red pipe wrench at the Reclamation Center", caption: "Character campaign · AI-assisted promotional artwork based on Gary’s current v6 design. Base character: Pixelhouse; adaptation and character design: WestCose." },
} satisfies Record<string, WorldMedia>;

export const models = [
  { id: "pier", title: "Dead Coast Pier sign", src: "/models/projects/westcose-world/pier-sign.glb", poster: media.pierGame, credit: "WestCose artwork. Sign generation: Higgsfield / Tripo H3.1. Assembly, fittings, materials, and runtime refinement: Blender." },
  { id: "shop", title: "WestCose Shop", src: "/models/projects/westcose-world/shop.glb", poster: media.shopFront, credit: "WestCose architecture, graphics, and composition. Adapted CC0 assets and PSX Building Kit Free by heyheythere (CC BY 4.0). Full credits below." },
] as const;
export type WorldModel = typeof models[number];

export const videos = {
  world: { title: "A walk through WestCose World", src: "/media/westcose-world/world-walkthrough.webm", fallback: "/media/westcose-world/world-walkthrough.mp4", width: 1440, height: 900, poster: media.explore, description: "A silent recording of the actual game: walking through town, visiting the waterfront, and returning to the globe view." },
  intro: { title: "The Dead Coast Broadcast", src: "/media/westcose-world/intro.webm", fallback: "/media/westcose-world/intro.mp4", width: 1920, height: 1080, poster: media.intro, description: "The eight-second opening film: an emergency broadcast, an undead seagull, and a collage of WestCose artwork. This portfolio cut is silent." },
} as const;
export type WorldVideo = typeof videos[keyof typeof videos];

export type WeaponExhibit = { id: string; name: string; family: string; description: string; upgrade?: string; image: WorldMedia };
export const weapons: readonly WeaponExhibit[] = [
  { id: "ak", name: "AK-47", family: "WALL RIFLE", description: "Wood furniture, dark steel, and a curved magazine give the wall rifle an immediately readable profile. This is the world model; the first-person AKM has its own authored model and reload.", image: { ...refinement.weapons.ak, title: "AK-47 model", alt: "Studio render of the game’s AK-47 wall model with wood stock and curved magazine", caption: "Current wall model · MaX3Dd / Sketchfab Standard. Portfolio studio render." } },
  { id: "mp5", name: "MP5", family: "COMPACT AUTOMATIC", description: "A compact silhouette with an integrated suppressor and open sights. The handless pickup model lets the shape and material work stand on their own.", image: { ...refinement.weapons.mp5, title: "MP5 model", alt: "Studio render of the current MP5SD game model with suppressor and open sights", caption: "Current pickup model · TastyTony / CC BY 4.0; adapted by WestCose. Portfolio studio render." } },
  { id: "riptide", name: "Riptide", family: "ORIGINAL WONDER WEAPON", description: "An original WestCose ray weapon with its own geometry, materials, and paint atlas. Its projectile behavior gives it a different role from the conventional arsenal.", upgrade: "King Tide", image: { ...refinement.weapons.riptide, title: "Riptide model", alt: "Studio render of WestCose’s original Riptide wonder weapon", caption: "Original WestCose model and materials · Portfolio studio render." } },
  { id: "blowhole", name: "The Blowhole", family: "ORIGINAL WONDER WEAPON", description: "A pressure weapon built around a broad, distinctive muzzle. The base version carries two charges; its Furnace upgrade becomes The Tsunami with four.", upgrade: "The Tsunami", image: { ...refinement.weapons.blowhole, title: "The Blowhole model", alt: "Studio render of WestCose’s original Blowhole pressure weapon", caption: "Original WestCose model and materials · Portfolio studio render." } },
];
