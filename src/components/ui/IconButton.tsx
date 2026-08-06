import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

import styles from "./IconButton.module.css";

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  children: ReactNode;
  label: string;
  selected?: boolean;
  buttonRef?: Ref<HTMLButtonElement>;
}

export function IconButton({
  children,
  className,
  label,
  selected,
  buttonRef,
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
      ref={buttonRef}
      type={type}
    >
      {children}
    </button>
  );
}
