import {
  Briefcase,
  ChatCircle,
  EnvelopeSimple,
  GameController,
  Gear,
  GithubLogo,
  Info,
  Flask,
  Note,
  Phone,
  Sword,
  TerminalWindow,
  Trash,
  UserCircle,
} from "@phosphor-icons/react";

import { ProjectsAppIcon } from "@/components/icons/app";

type AppGlyphProps = {
  className?: string;
  iconKey: string;
  size?: number;
  variant?: "desktop" | "pocket" | "system";
};

export function AppGlyph({
  className,
  iconKey,
  size = 28,
  variant = "system",
}: AppGlyphProps) {
  if (iconKey === "projects") {
    return (
      <ProjectsAppIcon
        className={className}
        decorative
        size={variant === "desktop" ? "desktop" : variant === "pocket" ? "pocket" : "system"}
      />
    );
  }

  const props = {
    "aria-hidden": true,
    className,
    size,
    weight: "duotone" as const,
  };

  switch (iconKey) {
    case "games":
      return <GameController {...props} />;
    case "experiments":
      return <Flask {...props} />;
    case "services":
      return <Briefcase {...props} />;
    case "about":
      return <UserCircle {...props} />;
    case "contact":
      return <EnvelopeSimple {...props} />;
    case "fightclub":
      return <Sword {...props} />;
    case "terminal":
      return <TerminalWindow {...props} />;
    case "github":
      return <GithubLogo {...props} />;
    case "recycle":
      return <Trash {...props} />;
    case "notes":
      return <Note {...props} />;
    case "settings":
      return <Gear {...props} />;
    case "messages":
      return <ChatCircle {...props} />;
    case "phone":
      return <Phone {...props} />;
    default:
      return <Info {...props} />;
  }
}
