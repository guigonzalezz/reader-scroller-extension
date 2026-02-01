import { cn } from "@/lib/utils";

interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-muted-foreground bg-secondary rounded min-w-[28px]",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
