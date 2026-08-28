"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/** Avatar with an initials fallback (also when the stored image 404s). */
export function UserAvatar({
  src,
  name,
  className,
  sizes = "64px",
}: {
  src: string | null;
  name: string;
  className?: string;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  const initials = name.slice(0, 2).toUpperCase();

  if (!src || failed) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-brand-gradient font-bold text-white",
          className,
        )}
      >
        {initials}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full shadow-sm",
        className,
      )}
    >
      <Image
        src={src}
        alt={name}
        fill
        sizes={sizes}
        className="object-cover"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
