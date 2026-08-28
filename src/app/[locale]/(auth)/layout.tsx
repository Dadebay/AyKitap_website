import { ChevronLeft } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-md px-5 pt-8">
        <Link
          href="/"
          className="inline-flex size-10 items-center justify-center rounded-full bg-card shadow-xs ring-1 ring-border transition-colors hover:bg-muted"
        >
          <ChevronLeft className="size-5" />
        </Link>
      </div>
      <main className="mx-auto w-full max-w-md flex-1 px-5 py-10">
        {children}
      </main>
    </div>
  );
}
