import { toTextBlocks } from "@/app/components/site/data";
import type { JSX } from "react";
import type { TextBlock } from "@/app/components/site/data";

/**
 * How the "- " / "• " lines show:
 * - "dashes": a short mint dash before each item (company context);
 * - "rules": one item per row, rows separated by a rule (like the missions of a position).
 */
export type ListStyle = "dashes" | "rules";

const listClass: Record<ListStyle, string> = {
  dashes: "-mt-2 flex flex-col gap-1.5 text-ink",
  rules: "flex flex-col text-ink",
};

const itemClass: Record<ListStyle, string> = {
  dashes: "relative pl-5",
  rules: "border-t border-line py-4",
};

/** Free text from the admin, as paragraphs and lists (never rendered as HTML). */
export function TextBlocks({ text, list = "dashes", className = "" }: { text: string; list?: ListStyle; className?: string }): JSX.Element {
  return (
    <div className={`flex flex-col gap-5 text-[19px] leading-[1.7] text-slate ${className}`}>
      {toTextBlocks(text).map((block: TextBlock, index: number) =>
        block.type === "paragraph" ? (
          <p key={index}>{block.text}</p>
        ) : (
          <ul key={index} className={listClass[list]}>
            {block.items.map((item: string, itemIndex: number) => (
              <li key={`${itemIndex}-${item}`} className={itemClass[list]}>
                {list === "dashes" && <span aria-hidden="true" className="absolute left-0 top-[0.85em] h-0.5 w-2 bg-mint" />}
                {item}
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}
