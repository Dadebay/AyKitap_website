import Image from "next/image";
import { Pause, SkipBack, SkipForward } from "lucide-react";
import { useTranslations } from "next-intl";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/app-links";

function GooglePlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 fill-current" aria-hidden>
      <path d="M3.6 2.4c-.4.2-.6.6-.6 1.1v17c0 .5.2.9.6 1.1l9.2-9.6-9.2-9.6zM14 10.8 5.4 2l10.9 6.3L14 10.8zm2.7 2.8 3.6-2.1c.9-.5.9-1.6 0-2.1l-3.6-2.1-3 3.2 3 3.1zM5.4 22l8.6-8.8 2.3 2.5L5.4 22z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 fill-current" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8.79-.16 2.24-.91 3.86-.77 1.66.13 2.9.79 3.68 1.99-3.35 2.01-2.81 6.42.5 7.67-.64 1.36-1.4 2.7-3.12 3.28zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function StoreButton({
  icon,
  small,
  big,
  href,
}: {
  icon: React.ReactNode;
  small: string;
  big: string;
  href?: string;
}) {
  return (
    <a
      href={href || "#"}
      {...(href ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex items-center gap-3 rounded-2xl bg-navy px-5 py-3 text-white shadow-lg shadow-black/15 transition-transform hover:-translate-y-0.5"
    >
      {icon}
      <span className="leading-tight">
        <span className="block text-[11px] font-medium text-white/70">
          {small}
        </span>
        <span className="block text-base font-bold">{big}</span>
      </span>
    </a>
  );
}

function PhoneMockups() {
  const t = useTranslations();

  return (
    <div
      className="relative hidden h-90 items-center justify-center lg:flex"
      aria-hidden
    >
      {/* back phone — reader */}
      <div className="absolute -rotate-8 -translate-x-24 -translate-y-3">
        <div className="w-48 rounded-[2.2rem] bg-navy p-2 shadow-2xl shadow-black/25">
          <div className="space-y-3 rounded-[1.7rem] bg-card px-4 py-6">
            <div className="mx-auto h-1 w-10 rounded-full bg-muted" />
            {[92, 100, 96, 88, 100, 94, 72].map((w, i) => (
              <div
                key={i}
                className="h-2 rounded-full bg-muted"
                style={{ width: `${w}%` }}
              />
            ))}
            <div className="h-2 w-1/2 rounded-full bg-secondary" />
            {[100, 90, 97, 84].map((w, i) => (
              <div
                key={i}
                className="h-2 rounded-full bg-muted"
                style={{ width: `${w}%` }}
              />
            ))}
            <div className="flex items-center justify-between pt-1">
              <div className="h-1.5 w-16 rounded-full bg-muted">
                <div className="h-full w-2/3 rounded-full bg-primary" />
              </div>
              <span className="text-[9px] font-semibold text-muted-foreground">
                49%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* front phone — player */}
      <div className="relative translate-x-14 rotate-6">
        <div className="w-52 rounded-[2.4rem] bg-navy p-2 shadow-2xl shadow-black/30">
          <div className="flex flex-col items-center gap-3.5 rounded-[1.9rem] bg-card px-5 pb-6 pt-4">
            <div className="h-1 w-10 rounded-full bg-muted" />
            <div className="relative aspect-2/3 w-28 overflow-hidden rounded-xl shadow-md">
              <Image
                src="/book-images/cover_01.jpg"
                alt=""
                fill
                sizes="112px"
                className="object-cover"
              />
            </div>
            <div className="w-full text-center">
              <div className="truncate text-xs font-bold">Gizlin arzuw</div>
              <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
                Bäşim Ataýew
              </div>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted">
              <div className="h-full w-2/5 rounded-full bg-brand-gradient" />
            </div>
            <div className="flex items-center gap-5">
              <SkipBack className="size-4 text-muted-foreground" />
              <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                <Pause className="size-4 fill-current" />
              </span>
              <SkipForward className="size-4 text-muted-foreground" />
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-[9px] font-semibold text-secondary-foreground">
              {t("book.readMore")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppPromo() {
  const t = useTranslations("home");

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-[#ffd9a8] via-[#ffb28a] to-[#f79fae] px-6 py-10 sm:px-10 sm:py-12 lg:px-14">
      <span
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-white/30 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -right-20 size-80 rounded-full bg-[#7c5cfc]/15 blur-3xl"
      />

      <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_1fr_auto]">
        <div className="max-w-md">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-[#47210f] sm:text-4xl">
            {t("appPromoTitle")}
          </h2>
          <p className="mt-3.5 text-base leading-relaxed text-[#47210f]/75 sm:text-lg">
            {t("appPromoDesc")}
          </p>
        </div>

        <PhoneMockups />

        <div className="justify-self-start lg:justify-self-end">
          <div className="flex flex-col items-center gap-5 sm:flex-row lg:gap-6">
            <div className="rounded-2xl bg-white p-3 shadow-lg shadow-black/10">
              <Image
                src="/qr-app.svg"
                alt={t("appPromoQrHint")}
                width={124}
                height={124}
                className="size-31"
              />
            </div>
            <div className="flex flex-col gap-3">
              <StoreButton
                icon={<GooglePlayIcon />}
                small={t("appPromoDownload")}
                big="Google Play"
                href={PLAY_STORE_URL}
              />
              <StoreButton
                icon={<AppleIcon />}
                small={t("appPromoDownload")}
                big="App Store"
                href={APP_STORE_URL}
              />
            </div>
          </div>
          <p className="mt-4 text-center text-sm font-medium text-[#47210f]/70">
            {t("appPromoFreeNote")} · {t("appPromoQrHint")}
          </p>
        </div>
      </div>
    </section>
  );
}
