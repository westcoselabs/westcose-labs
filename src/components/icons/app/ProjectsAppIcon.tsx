import Image from "next/image";

import styles from "./ProjectsAppIcon.module.css";

export interface ProjectsAppIconProps {
  className?: string;
  decorative?: boolean;
  label?: string;
  size?: "artwork" | "desktop" | "pocket" | "system";
}

export function ProjectsAppIcon({
  className,
  decorative = true,
  label = "Projects",
  size = "desktop",
}: ProjectsAppIconProps) {
  return (
    <Image
      alt={decorative ? "" : label}
      className={[styles.icon, styles[size], className].filter(Boolean).join(" ")}
      height={96}
      priority={false}
      src="/icons/apps/projects.svg"
      width={96}
    />
  );
}
