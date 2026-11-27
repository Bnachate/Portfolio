import { toTextBlocks } from "@/app/components/site/data";

/** Free text from the admin, as paragraphs and bulleted lists (never rendered as HTML). */
export function TextBlocks({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={`flex flex-col gap-5 text-[19px] leading-[1.7] text-slate ${className}`}>
      {toTextBlocks(text).map((block, index) =>
        block.type === "paragraph" ? (
          <p key={index}>{block.text}</p>
        ) : (
          <ul key={index} className="-mt-2 flex flex-col gap-1.5 text-ink">
            {block.items.map((item, itemIndex) => (
              <li key={`${itemIndex}-${item}`} className="relative pl-5">
                <span aria-hidden="true" className="absolute left-0 top-[0.85em] h-0.5 w-2 bg-mint" />
                {item}
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}
