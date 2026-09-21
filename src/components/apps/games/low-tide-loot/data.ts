export type LootCategory =
  "jewelry" | "valuable" | "scrap" | "crab" | "mystery";
export type LootDefinition = {
  id: string;
  name: string;
  value: number;
  weight: number;
  radius: number;
  category: LootCategory;
  rarity: "common" | "uncommon" | "rare";
  movable?: boolean;
  mystery?: boolean;
  destructible: boolean;
  quip?: string;
};
const item = (
  id: string,
  name: string,
  value: number,
  weight: number,
  radius: number,
  category: LootCategory,
  extra: Partial<LootDefinition> = {},
): LootDefinition => ({
  id,
  name,
  value,
  weight,
  radius,
  category,
  rarity: "common",
  destructible: true,
  ...extra,
});
export const LOOT: Record<string, LootDefinition> = {
  ring: item("ring", "Diamond ring", 600, 0.35, 12, "jewelry", {
    rarity: "rare",
  }),
  watch: item("watch", "Expensive watch", 450, 0.65, 16, "jewelry", {
    rarity: "uncommon",
  }),
  gold: item("gold", "Fat gold chain", 500, 4.8, 25, "jewelry"),
  cash: item("cash", "Buried cash roll", 250, 0.45, 15, "valuable"),
  phone: item("phone", "Phone that still works", 180, 1.1, 20, "valuable", {
    quip: "Still at 2%.",
  }),
  camera: item("camera", "Vintage camera", 150, 1.5, 23, "valuable"),
  shades: item("shades", "Sunglasses", 75, 0.55, 21, "valuable"),
  wallet: item("wallet", "Wallet", 60, 0.65, 21, "valuable"),
  silver: item("silver", "Silver chain", 55, 0.85, 20, "jewelry"),
  earbuds: item("earbuds", "Wireless earbuds", 50, 0.4, 17, "valuable"),
  keys: item("keys", "Car keys", 35, 0.5, 17, "valuable"),
  anchor: item("anchor", "Anchor", 8, 10, 25, "scrap", {
    quip: "An ambitious use of your time.",
  }),
  concrete: item("concrete", "Concrete chunk", 3, 11, 25, "scrap", {
    quip: "Landlord accepts cash, actually.",
  }),
  tire: item("tire", "Bald tire", 5, 7, 25, "scrap"),
  flipflop: item("flipflop", "Single flip-flop", 1, 0.5, 19, "scrap", {
    quip: "Someone somewhere is furious.",
  }),
  towel: item("towel", "Wet beach towel", 2, 4, 24, "scrap"),
  board: item("board", "Broken boogie board", 4, 3.5, 25, "scrap"),
  motel: item("motel", "Motel room key", 13, 0.3, 16, "scrap", {
    quip: "Don't ask.",
  }),
  crab: item("crab", "Normal crab", 45, 1, 20, "crab", { movable: true }),
  jewelryCrab: item("jewelryCrab", "Jewelry crab", 650, 1.3, 22, "jewelry", {
    movable: true,
    rarity: "rare",
    quip: "Unlicensed jeweler.",
  }),
  cooler: item("cooler", "Mystery cooler", 0, 2.2, 25, "mystery", {
    mystery: true,
  }),
  drive: item("drive", "Suspicious hard drive", 404, 1.2, 19, "valuable", {
    rarity: "rare",
    quip: "Probably fine.",
  }),
};

export type UpgradeId = "bomb" | "energy" | "shell" | "polish" | "guide";
export type Boosts = Record<Exclude<UpgradeId, "bomb">, boolean>;
export const emptyBoosts = (): Boosts => ({
  energy: false,
  shell: false,
  polish: false,
  guide: false,
});
export const UPGRADES: Record<
  UpgradeId,
  { name: string; price: number; description: string; mark: string }
> = {
  bomb: {
    name: "Beach bomb",
    price: 75,
    description: "Ditch one hooked mistake. Carry up to 5.",
    mark: "✹",
  },
  energy: {
    name: "Gas station energy",
    price: 150,
    description: "Reel in 45% faster next day. Tastes illegal.",
    mark: "↯",
  },
  shell: {
    name: "Lucky shell",
    price: 125,
    description: "Better cooler odds next day. Scientifically unproven.",
    mark: "◒",
  },
  polish: {
    name: "Jewelry polish",
    price: 200,
    description: "Jewelry pays 35% more next day. Even stolen jewelry.",
    mark: "◇",
  },
  guide: {
    name: "Scrap yard price guide",
    price: 100,
    description: "Scrap pays 12×, at least $40, next day.",
    mark: "▤",
  },
};
export const ENVIRONMENTS = [
  {
    name: "Public Beach",
    sand: "#c6ad7e",
    deep: "#a88760",
    sky: "#203c3c",
    accent: "#f5c34e",
    prop: "palms",
  },
  {
    name: "The Pier",
    sand: "#b4a47f",
    deep: "#85795f",
    sky: "#24464c",
    accent: "#e1a764",
    prop: "pier",
  },
  {
    name: "Boardwalk",
    sand: "#c19d79",
    deep: "#997354",
    sky: "#554143",
    accent: "#ef7795",
    prop: "boardwalk",
  },
  {
    name: "Motel Beach",
    sand: "#b4a388",
    deep: "#8e776c",
    sky: "#333a4d",
    accent: "#eea6b1",
    prop: "motel",
  },
  {
    name: "Dead Coast",
    sand: "#aca087",
    deep: "#776f61",
    sky: "#243638",
    accent: "#b5c49b",
    prop: "wreck",
  },
  {
    name: "Storm Drain",
    sand: "#a0a18c",
    deep: "#777f6c",
    sky: "#253d45",
    accent: "#87b5b4",
    prop: "rain",
  },
  {
    name: "Hidden Beach",
    sand: "#c3b78a",
    deep: "#9b986c",
    sky: "#27474a",
    accent: "#f1cd79",
    prop: "island",
  },
] as const;
export type MysteryReward = {
  id: string;
  name: string;
  value: number;
  weight: number;
  lucky: number;
  gift?: UpgradeId;
  quip?: string;
};
export const MYSTERY_REWARDS: readonly MysteryReward[] = [
  {
    id: "jackpot",
    name: "Emergency rent fund",
    value: 500,
    weight: 3,
    lucky: 8,
  },
  { id: "jewelry", name: "Cooler jewelry", value: 600, weight: 2, lucky: 5 },
  { id: "cash250", name: "Rolled-up cash", value: 250, weight: 12, lucky: 19 },
  { id: "cash100", name: "A hundred bucks", value: 100, weight: 22, lucky: 23 },
  { id: "cash50", name: "Beer money", value: 50, weight: 24, lucky: 18 },
  {
    id: "bomb",
    name: "Free Beach Bomb",
    value: 0,
    weight: 9,
    lucky: 9,
    gift: "bomb",
  },
  {
    id: "energy",
    name: "Free energy drink",
    value: 0,
    weight: 6,
    lucky: 7,
    gift: "energy",
  },
  {
    id: "shell",
    name: "Lucky shell",
    value: 0,
    weight: 5,
    lucky: 5,
    gift: "shell",
  },
  { id: "dollar", name: "One damp dollar", value: 1, weight: 10, lucky: 3 },
  {
    id: "nothing",
    name: "Nothing",
    value: 0,
    weight: 5,
    lucky: 1,
    quip: "Just warm mayonnaise.",
  },
  {
    id: "psd",
    name: "Final_FINAL_v8.psd",
    value: 404,
    weight: 2,
    lucky: 2,
    quip: "Client has one tiny change.",
  },
];
