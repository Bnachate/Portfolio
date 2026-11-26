/** "BN" monogram (decorative: the name next to it carries the meaning). Mint on ink backgrounds, ink on light ones. */
export function LogoMark({ onInk = false }: { onInk?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg font-display text-base font-bold tracking-[-0.02em] ${onInk ? "bg-mint-light text-ink" : "bg-ink text-on-ink"}`}
    >
      BN
    </span>
  );
}
