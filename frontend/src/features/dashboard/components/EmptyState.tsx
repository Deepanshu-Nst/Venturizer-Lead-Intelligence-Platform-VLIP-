import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f7f8fa] border border-border">
        <Icon className="h-6 w-6 text-muted-foreground/50" aria-hidden />
      </div>
      <h3 className="text-[15px] font-semibold text-[#0d1428] mb-2">{title}</h3>
      <p className="text-[13px] text-muted-foreground max-w-sm leading-relaxed">{description}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-6 rounded-xl bg-[#0d1428] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1a2540] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
