import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import styles from "./Button.module.css";

type ButtonTone = "danger" | "primary" | "secondary";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
  tone?: ButtonTone;
}

export function Button({
  children,
  className,
  fullWidth = false,
  tone = "secondary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cx(
        styles.button,
        styles[tone],
        fullWidth && styles.fullWidth,
        className,
      )}
      type={type}
    >
      {children}
    </button>
  );
}

export interface ButtonLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  fullWidth?: boolean;
  tone?: ButtonTone;
}

export function ButtonLink({
  children,
  className,
  fullWidth = false,
  tone = "secondary",
  ...props
}: ButtonLinkProps) {
  return (
    <a
      {...props}
      className={cx(
        styles.link,
        styles[tone],
        fullWidth && styles.fullWidth,
        className,
      )}
    >
      {children}
    </a>
  );
}
