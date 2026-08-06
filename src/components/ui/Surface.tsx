import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";

import styles from "./Surface.module.css";

type StructuralElement =
  | "article"
  | "aside"
  | "div"
  | "footer"
  | "header"
  | "li"
  | "main"
  | "nav"
  | "section";

export interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  as?: StructuralElement;
  children?: ReactNode;
  disabled?: boolean;
  selected?: boolean;
}

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function MaterialSurface({
  as: Element = "div",
  children,
  className,
  disabled = false,
  selected = false,
  surfaceKind,
  variant,
  ...props
}: SurfaceProps & { surfaceKind: string; variant: string }) {
  return (
    <Element
      {...props}
      aria-disabled={disabled || undefined}
      className={cx(styles.surface, variant, className)}
      data-disabled={disabled || undefined}
      data-selected={selected || undefined}
      data-surface={surfaceKind}
    >
      {children}
    </Element>
  );
}

export function SurfaceRaised(props: SurfaceProps) {
  return (
    <MaterialSurface {...props} surfaceKind="raised" variant={styles.raised} />
  );
}

export function SurfaceRecessed(props: SurfaceProps) {
  return (
    <MaterialSurface
      {...props}
      surfaceKind="recessed"
      variant={styles.recessed}
    />
  );
}

export function SurfaceFloating(props: SurfaceProps) {
  return (
    <MaterialSurface
      {...props}
      surfaceKind="floating"
      variant={styles.floating}
    />
  );
}

export function ActiveSurface(props: Omit<SurfaceProps, "selected">) {
  return (
    <MaterialSurface
      {...props}
      selected
      surfaceKind="active"
      variant={styles.active}
    />
  );
}

export interface PressableSurfaceProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function PressableSurface({
  children,
  className,
  selected,
  type = "button",
  ...props
}: PressableSurfaceProps) {
  return (
    <button
      {...props}
      aria-pressed={selected}
      className={cx(styles.surface, styles.pressable, className)}
      data-selected={selected || undefined}
      data-surface="pressable"
      type={type}
    >
      {children}
    </button>
  );
}
