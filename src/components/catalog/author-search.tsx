"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "@/i18n/navigation";

export function AuthorSearch({
  placeholder,
  initialValue,
}: {
  placeholder: string;
  initialValue: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialValue);

  return (
    <form
      role="search"
      className="relative w-full max-w-sm"
      onSubmit={(e) => {
        e.preventDefault();
        const s = q.trim();
        router.replace(
          s ? `/authors?search=${encodeURIComponent(s)}` : "/authors",
          { scroll: false },
        );
      }}
    >
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-full border-transparent bg-card pl-10 text-sm shadow-xs ring-1 ring-black/3 transition-colors focus-visible:ring-primary/30"
      />
    </form>
  );
}
