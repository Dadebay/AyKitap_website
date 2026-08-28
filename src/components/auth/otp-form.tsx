"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { formatCountdown } from "@/lib/format";
import { cn } from "@/lib/utils";

const RESEND_SECONDS = 30;

export function OtpForm({
  onVerify,
  onResend,
  error,
  submitting,
}: {
  onVerify: (code: string) => void;
  onResend?: () => void;
  error?: string | null;
  submitting?: boolean;
}) {
  const t = useTranslations("auth");
  const [code, setCode] = useState("");
  const [left, setLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (left <= 0) return;
    const id = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [left]);

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (code.length === 4 && !submitting) onVerify(code);
      }}
    >
      <div className="space-y-3">
        <InputOTP
          maxLength={4}
          value={code}
          onChange={(v) => {
            setCode(v);
            // Submit as soon as the 4th digit lands.
            if (v.length === 4 && !submitting) onVerify(v);
          }}
          autoFocus
          containerClassName="justify-center gap-3"
        >
          <InputOTPGroup className="gap-3">
            {[0, 1, 2, 3].map((i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className={cn(
                  "size-14 rounded-2xl border bg-card text-xl font-bold shadow-none first:rounded-l-2xl last:rounded-r-2xl data-[active=true]:border-primary data-[active=true]:ring-2 data-[active=true]:ring-primary/25 sm:size-16",
                  error ? "border-destructive" : "border-input",
                )}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
        {error && (
          <p className="text-center text-sm font-medium text-destructive">
            {error}
          </p>
        )}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        {left > 0 ? (
          <span>{t("resendIn", { time: formatCountdown(left) })}</span>
        ) : (
          <button
            type="button"
            className="font-semibold text-primary transition-colors hover:text-primary/80"
            onClick={() => {
              setLeft(RESEND_SECONDS);
              setCode("");
              onResend?.();
            }}
          >
            {t("resend")}
          </button>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={code.length !== 4 || submitting}
        className="h-13 w-full rounded-2xl text-base font-semibold"
      >
        {submitting && <Loader2 className="size-5 animate-spin" />}
        {t("verify")}
      </Button>
    </form>
  );
}
