import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  title?: string;
  badge?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Panel({ title, badge, children, className, bodyClassName }: Props) {
  return (
    <section className={cn("hud-panel hud-clip flex min-h-0 flex-col", className)}>
      {/* corner accents */}
      <span className="pointer-events-none absolute right-0 top-0 h-4 w-4 border-r border-t border-hud-300/50" />
      <span className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b border-l border-hud-300/50" />

      {title && (
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-hud-400/15 px-3 py-2">
          <h2 className="font-display text-[10px] tracking-[0.28em] text-hud-200/85">{title}</h2>
          {badge && (
            <span className="rounded-sm bg-hud-400/10 px-1.5 py-0.5 font-display text-[9px] tracking-[0.18em] text-hud-300/80">
              {badge}
            </span>
          )}
        </header>
      )}
      <div className={cn("min-h-0 flex-1 p-3", bodyClassName)}>{children}</div>
    </section>
  );
}
