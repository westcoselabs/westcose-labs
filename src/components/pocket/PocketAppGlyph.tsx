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
  Trash,
  Wrench,
} from "@phosphor-icons/react";

import { ProjectsAppIcon } from "@/components/icons/app";

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
  recycle: Trash,
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
  if (iconKey === "low-tide-loot")
    return (
      <Image
        src="/games/low-tide-loot/cover.webp"
        alt=""
        width={64}
        height={64}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "inherit",
        }}
      />
    );

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
