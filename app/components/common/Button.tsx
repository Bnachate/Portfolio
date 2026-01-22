type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  variant?: "plain" | "outline" | "ghost";
};

export function Button({
  children,
  variant = "plain",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl h-12 w-32 cursor-pointer font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-600 disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    plain: "bg-cyan-600 text-white hover:bg-cyan-700 hover:shadow-lg",
    outline: "border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50",
    ghost: "text-gray-700 hover:bg-gray-100 hover:text-cyan-600",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
