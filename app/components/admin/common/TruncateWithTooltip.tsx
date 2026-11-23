"use client";

import { useEffect, useRef, useState } from "react";

/** Truncated text that shows its full value as a tooltip only when it actually overflows. */
export function TruncateWithTooltip({ text, className }: { text: string; className: string }) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const checkTruncate = () => setIsTruncated(element.scrollWidth > element.clientWidth);
    checkTruncate();

    const observer = new ResizeObserver(checkTruncate);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text]);

  return (
    <span ref={textRef} className={className} title={isTruncated ? text : undefined}>
      {text}
    </span>
  );
}
