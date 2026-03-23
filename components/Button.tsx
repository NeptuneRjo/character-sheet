"use client";

interface Props {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  className?: string;
}

const Button = ({
  variant = "primary",
  children,
  onClick,
  className,
}: Props) => {
  const variantClasses = {
    primary:
      "border-[#8b6a3f] text-[#f0d9a8] hover:border-[#b38952] hover:text-[#fae2af]",
    secondary:
      "border-[#5c4a33] text-[#b7a387] hover:border-[#735c3f] hover:text-[#d4bd9d]",
  };

  return (
    <button
      className={`rounded-full border bg-transparent px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] hover:cursor-pointer ${className} ${variantClasses[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
