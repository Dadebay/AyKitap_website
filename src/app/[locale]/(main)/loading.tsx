import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="aspect-16/8 w-full rounded-3xl sm:aspect-16/5" />
      <div className="space-y-5">
        <Skeleton className="h-7 w-48 rounded-full" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-2/3 w-full rounded-2xl" />
              <Skeleton className="h-4 w-3/4 rounded-full" />
              <Skeleton className="h-3.5 w-1/2 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
