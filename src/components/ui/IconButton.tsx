import type { ButtonHTMLAttributes, ReactNode } from "react";

import styles from "./IconButton.module.css";

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  children: ReactNode;
  label: string;
  selected?: boolean;
}

export function IconButton({
  children,
  className,
  label,
  selected,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      aria-label={label}
      aria-pressed={selected}
      className={[styles.button, className].filter(Boolean).join(" ")}
      data-selected={selected || undefined}
      type={type}
    >
      {children}
    </button>
  );
}
