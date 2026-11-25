type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  variant?: "plain" | "outline" | "ghost";
  color?: "primary" | "secondary";
};

/**
 * Admin button ("Encre et menthe"): 8 px radius, at least 44 px high.
 * plain primary = ink (mint on hover), plain secondary = danger, outline, ghost (icon buttons).
 */
export function Button({
  children,
  variant = "plain",
  color = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-lg px-5 font-display text-base font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    plain: color === "primary" ? "bg-ink text-on-ink hover:bg-mint" : "bg-danger text-on-ink hover:bg-ink",
    outline:
      color === "primary"
        ? "border-[1.5px] border-ink text-ink hover:border-mint hover:text-mint"
        : "border-[1.5px] border-danger text-danger hover:bg-danger-pale",
    ghost: color === "primary" ? "text-ink hover:bg-mist" : "text-danger hover:bg-danger-pale",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
