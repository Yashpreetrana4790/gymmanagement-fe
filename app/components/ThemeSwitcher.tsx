import { useFetcher } from "react-router";
import * as Popover from "@radix-ui/react-popover";
import { Palette } from "lucide-react";
import { cn } from "~/lib/utils";

export type AccentColor = "orange" | "blue" | "green" | "purple" | "rose";

const ACCENTS: { value: AccentColor; label: string; bg: string }[] = [
  { value: "orange", label: "Orange", bg: "bg-orange-500" },
  { value: "blue",   label: "Blue",   bg: "bg-blue-500"   },
  { value: "green",  label: "Green",  bg: "bg-emerald-500"},
  { value: "purple", label: "Purple", bg: "bg-violet-500" },
  { value: "rose",   label: "Rose",   bg: "bg-rose-500"   },
];

interface Props { accent: AccentColor }

export function ThemeSwitcher({ accent }: Props) {
  const fetcher = useFetcher();

  function apply(next: AccentColor) {
    const data = new FormData();
    data.set("accent", next);
    fetcher.submit(data, { method: "POST", action: "/api/theme" });
    document.documentElement.dataset.accent = next;
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          title="Accent color"
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
            "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <Palette className="w-5 h-5 shrink-0" />
          <span>Accent color</span>
          <span className={cn("ml-auto w-3 h-3 rounded-full shrink-0", ACCENTS.find(a => a.value === accent)?.bg)} />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="right"
          sideOffset={8}
          align="end"
          className={cn(
            "z-50 w-48 rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl p-4",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=right]:slide-in-from-left-2"
          )}
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Accent color
          </p>
          <div className="flex gap-2">
            {ACCENTS.map(a => (
              <button
                key={a.value}
                title={a.label}
                onClick={() => apply(a.value)}
                className={cn(
                  "w-7 h-7 rounded-full transition-all ring-offset-2 ring-offset-popover",
                  a.bg,
                  accent === a.value
                    ? "ring-2 ring-primary scale-110"
                    : "opacity-50 hover:opacity-100 hover:scale-105"
                )}
              />
            ))}
          </div>
          <Popover.Arrow className="fill-popover" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
