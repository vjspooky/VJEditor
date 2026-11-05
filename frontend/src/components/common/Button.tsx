import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  className?: string;
}

export default function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition cursor-pointer text-sm";
  const styles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50",
    secondary: "bg-neutral-800 text-neutral-200 hover:bg-neutral-700 disabled:opacity-50 border border-neutral-700",
    danger: "bg-red-600 text-white hover:bg-red-500 disabled:opacity-50",
    ghost: "bg-transparent text-neutral-300 hover:bg-neutral-800 disabled:opacity-50",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
