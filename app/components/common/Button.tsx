type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  variant?: "plain" | "outline" | "ghost";
  color?: "primary" | "secondary";
};

export function Button({
  children,
  variant = "plain",
  color = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl h-12 w-32 max-w-full cursor-pointer font-medium transition-all duration-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50";

  const colorClasses = {
    primary: "focus:ring-cyan-600",
    secondary: "focus:ring-red-600",
  };

  const variants = {
    plain: color === "primary"
      ? "bg-cyan-600 text-white hover:bg-cyan-700 hover:shadow-lg"
      : "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg",
    outline: color === "primary"
      ? "border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50 focus:ring-2"
      : "border-2 border-red-600 text-red-600 hover:bg-red-50 focus:ring-2",
    ghost: color === "primary"
      ? "text-gray-700 hover:text-cyan-600 hover:bg-transparent"
      : "text-gray-700 hover:text-red-600 hover:bg-transparent",
  };

  return (
    <button
      className={`${base} ${colorClasses[color]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
