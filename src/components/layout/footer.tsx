import Image from "next/image";
import { Mail, Phone, Send } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getContactInfo } from "@/lib/api/contacts";

// lucide-react dropped brand icons; classic Instagram glyph in the same
// 24px / 2px-stroke style so it sits next to Mail/Phone/Send seamlessly.
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export async function Footer() {
  const t = await getTranslations();
  const contact = await getContactInfo();
  const year = new Date().getFullYear();

  const sections = [
    { href: "/", label: t("nav.home") },
    { href: "/books", label: t("nav.catalog") },
    { href: "/authors", label: t("nav.authors") },
  ] as const;
  const account = [
    { href: "/profile", label: t("nav.profile") },
    { href: "/profile/books", label: t("account.myBooks") },
    { href: "/wishlist", label: t("nav.wishlist") },
    { href: "/profile/balance", label: t("account.balance") },
  ] as const;
  // The admin can point the legal entries at external documents; without them
  // the built-in pages are used.
  const info = [
    { href: "/about", label: t("footer.about"), external: false },
    {
      href: contact.termsLink ?? "/terms",
      label: t("footer.terms"),
      external: Boolean(contact.termsLink),
    },
    {
      href: "/privacy",
      label: t("footer.privacy"),
      external: Boolean(contact.privacyLink),
    },
  ] as const;
  const contacts = [
    {
      href: contact.phoneHref,
      label: contact.phone,
      icon: Phone,
      external: false,
    },
    {
      href: contact.email ? `mailto:${contact.email}` : null,
      label: contact.email,
      icon: Mail,
      external: false,
    },
    {
      href: contact.telegramHref,
      label: contact.telegram,
      icon: Send,
      external: true,
    },
    {
      href: contact.instagramHref,
      label: contact.instagram,
      icon: InstagramIcon,
      external: true,
    },
  ].filter((c): c is typeof c & { href: string; label: string } =>
    Boolean(c.href && c.label),
  );

  return (
    <footer className="mt-20 bg-navy text-navy-foreground">
      <div className="h-0.5 bg-brand-gradient" />
      <div
        className={`mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:grid-cols-2 lg:px-8 ${
          contacts.length > 0
            ? "md:grid-cols-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr]"
            : "md:grid-cols-[1.6fr_1fr_1fr_1fr]"
        }`}
      >
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Aýkitap"
              width={40}
              height={40}
              className="size-10 rounded-xl"
            />
            <span className="text-xl font-bold">Aýkitap</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            {t("footer.tagline")}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">
            {t("footer.sections")}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {sections.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-white/70 transition-colors hover:text-white"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">
            {t("footer.account")}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {account.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-white/70 transition-colors hover:text-white"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">
            {t("footer.info")}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {info.map((l) =>
              l.external ? (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {l.label}
                  </a>
                </li>
              ) : (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </div>

        {contacts.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">
              {t("footer.contact")}
            </h3>
            <ul className="mt-4 space-y-3">
              {contacts.map(({ href, label, icon: Icon, external }) => (
                <li key={href}>
                  <a
                    href={href}
                    {...(external
                      ? { target: "_blank", rel: "noreferrer noopener" }
                      : {})}
                    className="group flex items-center gap-2.5 text-sm text-white/70 transition-colors hover:text-white"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/8 text-white/60 transition-colors group-hover:bg-brand-gradient group-hover:text-white">
                      <Icon className="size-4" />
                    </span>
                    <span dir="ltr">{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 text-xs text-white/50 sm:px-6 lg:px-8">
          <span>
            © {year} Aýkitap. {t("footer.rights")}
          </span>
        </div>
      </div>
    </footer>
  );
}
