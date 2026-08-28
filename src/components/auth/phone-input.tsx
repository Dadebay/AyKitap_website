"use client";

import Image from "next/image";
import { formatPhone } from "@/lib/format";

export function PhoneInput({
  value,
  onChange,
  autoFocus,
}: {
  /** Digits only, max 8 (without +993) */
  value: string;
  onChange: (digits: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <div className="flex h-14 items-center gap-3 rounded-2xl border border-input bg-card px-4 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
      <span className="flex shrink-0 items-center gap-2 border-r border-border pr-3">
        <Image
          src="/flags/tm.svg"
          alt="TM"
          width={24}
          height={24}
          className="size-6 rounded-sm object-cover"
        />
        <span className="font-semibold">+993</span>
      </span>
      <input
        type="tel"
        inputMode="numeric"
        autoFocus={autoFocus}
        value={formatPhone(value)}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
          onChange(digits);
        }}
        placeholder="XX XX XX XX"
        className="w-full bg-transparent text-lg font-medium tracking-wide outline-none placeholder:text-muted-foreground/50"
      />
    </div>
  );
}
