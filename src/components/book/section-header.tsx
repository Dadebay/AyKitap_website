import { Link } from "@/i18n/navigation";

export function SectionHeader({
  title,
  description,
  href,
  seeAllLabel,
}: {
  title: string;
  description?: string;
  href?: string;
  seeAllLabel?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
          {title}
        </h2>
        <span className="mt-2 block h-[3px] w-9 rounded-full bg-brand-gradient" />
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {href && seeAllLabel && (
        <Link
          href={href}
          className="shrink-0 pb-0.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
        >
          {seeAllLabel}
        </Link>
      )}
    </div>
  );
}
