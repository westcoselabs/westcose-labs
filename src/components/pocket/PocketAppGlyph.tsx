import Image from "next/image";
import type { Icon } from "@phosphor-icons/react";
import {
  ArrowSquareOut,
  Bird,
  BoxingGlove,
  ChatCircle,
  Flask,
  FolderOpen,
  GameController,
  Gear,
  GithubLogo,
  IdentificationCard,
  Note,
  Phone,
  Palette,
  Warning,
  Wrench,
} from "@phosphor-icons/react";

import { ProjectsAppIcon } from "@/components/icons/app";
import { ThemeGlyph } from "@/components/icons/ThemeGlyph";

const glyphs = {
  about: IdentificationCard,
  experiments: Flask,
  fightclub: BoxingGlove,
  shitbird: Bird,
  games: GameController,
  github: GithubLogo,
  messages: ChatCircle,
  notes: Note,
  phone: Phone,
  recycle: Warning,
  themes: Palette,
  services: Wrench,
  settings: Gear,
} satisfies Record<string, Icon>;

interface PocketAppGlyphProps {
  readonly iconKey: string;
  readonly size?: "dock" | "grid";
}

export function PocketAppGlyph({
  iconKey,
  size = "grid",
}: PocketAppGlyphProps) {
  const covers: Record<string, string> = {
    world: "/icons/apps/world.png",
    shitbird: "/games/shitbird/cover.webp",
    "low-tide-loot": "/games/low-tide-loot/cover.webp",
    fightclub: "/images/projects/citryn-fight-club.webp",
  };
  if (covers[iconKey]) return <Image src={covers[iconKey]} alt="" width={160} height={160} sizes="80px" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} />;
  return <ThemeGlyph iconKey={iconKey} size={size === "dock" ? 36 : 48}>
    <StandardPocketAppGlyph iconKey={iconKey} size={size} />
  </ThemeGlyph>;
}

function StandardPocketAppGlyph({
  iconKey,
  size = "grid",
}: PocketAppGlyphProps) {
  if (iconKey === "projects") {
    return <ProjectsAppIcon size={size === "dock" ? "system" : "pocket"} />;
  }

  const Glyph =
    glyphs[iconKey as keyof typeof glyphs] ??
    (iconKey.startsWith("social-") ? ArrowSquareOut : FolderOpen);

  return (
    <Glyph
      aria-hidden="true"
      size={size === "dock" ? 26 : 30}
      weight="duotone"
    />
  );
}
