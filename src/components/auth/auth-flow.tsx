"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  MessageSquareText,
  Smartphone,
  UserRound,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { OtpForm } from "@/components/auth/otp-form";
import { PhoneInput } from "@/components/auth/phone-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/client";
import { formatPhone } from "@/lib/format";
import { useAuthStore } from "@/lib/stores/auth-store";

function GradientIconTile({ icon: Icon }: { icon: typeof Smartphone }) {
  return (
    <span className="flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-[#f973a0] to-[#c65cf2] shadow-lg shadow-[#c65cf2]/30">
      <Icon className="size-7 text-white" />
    </span>
  );
}

export function AuthFlow({ mode }: { mode: "login" | "signup" }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const requestOtp = useAuthStore((s) => s.requestOtp);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const pendingPhone = useAuthStore((s) => s.pendingPhone);

  const [step, setStep] = useState<"form" | "otp">("form");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    phone.length === 8 &&
    !submitting &&
    (mode === "login" || username.trim().length >= 2);

  function describeError(e: unknown): string {
    if (e instanceof ApiError) {
      if (e.status === 404) return t("wrongCode");
      if (e.status === 400) return t("tooManyAttempts");
      if (e.status === 503) return t("smsFailed");
      if (e.status === 0) return t("networkError");
      return e.message;
    }
    return t("networkError");
  }

  async function handleSendCode() {
    setSubmitting(true);
    setError(null);
    try {
      await requestOtp(phone, mode === "signup" ? username : undefined);
      setStep("otp");
    } catch (e) {
      setError(describeError(e));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(code: string) {
    setSubmitting(true);
    setError(null);
    try {
      const user = await verifyOtp(code);
      toast.success(
        user.username ? `👋 ${user.username}` : `👋 ${t("welcome")}`,
      );
      router.push(next || "/");
    } catch (e) {
      setError(describeError(e));
      setSubmitting(false);
    }
  }

  if (step === "otp") {
    return (
      <div className="space-y-8">
        <GradientIconTile icon={MessageSquareText} />
        <div className="space-y-2.5">
          <h1 className="text-3xl font-bold tracking-tight">{t("otpTitle")}</h1>
          <p className="text-muted-foreground">
            {t("otpSubtitle")}{" "}
            <span className="font-semibold text-foreground">
              {pendingPhone
                ? `+993 ${formatPhone(pendingPhone.replace(/^\+993/, ""))}`
                : ""}
            </span>
          </p>
        </div>
        <OtpForm
          onVerify={handleVerify}
          onResend={() => {
            requestOtp(phone, mode === "signup" ? username : undefined).catch(
              (e) => toast.error(describeError(e)),
            );
          }}
          error={error}
          submitting={submitting}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <GradientIconTile icon={mode === "login" ? Smartphone : UserRound} />
      <div className="space-y-2.5">
        <h1 className="text-3xl font-bold tracking-tight">
          {mode === "login" ? t("loginTitle") : t("signupTitle")}
        </h1>
        <p className="text-muted-foreground">
          {mode === "login" ? t("loginSubtitle") : t("signupSubtitle")}
        </p>
      </div>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) handleSendCode();
        }}
      >
        {mode === "signup" && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              {t("usernameLabel")}
            </Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t("usernamePlaceholder")}
              autoFocus
              className="h-14 rounded-2xl border-input bg-card px-4 text-lg font-medium shadow-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            {t("phoneLabel")}
          </Label>
          <PhoneInput
            value={phone}
            onChange={setPhone}
            autoFocus={mode === "login"}
          />
        </div>

        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={!canSubmit}
          className="h-13 w-full rounded-2xl text-base font-semibold"
        >
          {submitting && <Loader2 className="size-5 animate-spin" />}
          {t("sendCode")}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        {t.rich("terms", {
          link: (chunks) => (
            <Link
              href="/terms"
              className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>

      <p className="text-sm text-muted-foreground">
        {mode === "login" ? t("noAccount") : t("haveAccount")}{" "}
        <Link
          href={
            (mode === "login" ? "/signup" : "/login") +
            (next ? `?next=${encodeURIComponent(next)}` : "")
          }
          className="font-semibold text-primary hover:underline"
        >
          {mode === "login" ? t("signupLink") : t("loginLink")}
        </Link>
      </p>
    </div>
  );
}
