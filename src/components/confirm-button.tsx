"use client";

import type { ReactNode } from "react";

type ConfirmButtonProps = {
  children: ReactNode;
  message: string;
  className?: string;
  ariaLabel?: string;
};

export function ConfirmButton({ children, message, className = "btn-quiet", ariaLabel }: ConfirmButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      aria-label={ariaLabel}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
