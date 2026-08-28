"use client";

import { useRef, useState } from "react";
import {
  Camera,
  Check,
  LibraryBig,
  Loader2,
  Pencil,
  Phone,
  Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { UserAvatar } from "@/components/account/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { ApiError, updateProfile, uploadImage } from "@/lib/api/client";
import { formatPhone } from "@/lib/format";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useLibraryStore } from "@/lib/stores/library-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";

function UsernameEditor() {
  const t = useTranslations();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.accessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const forceLogout = useAuthStore((s) => s.forceLogout);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(user?.username ?? "");
  const [saving, setSaving] = useState(false);

  if (!user || !token) return null;

  async function save() {
    if (!token) return;
    const username = value.trim();
    if (username.length < 2 || saving) return;
    setSaving(true);
    try {
      setUser(await updateProfile(token, { username }));
      toast.success(t("profile.usernameUpdated"));
      setEditing(false);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) forceLogout();
      else toast.error(t("auth.networkError"));
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <span className="flex items-center gap-2">
        <h2 className="text-xl font-bold">
          {user.username ||
            `+993 ${formatPhone(user.phone.replace(/^\+993/, ""))}`}
        </h2>
        <button
          type="button"
          aria-label={t("profile.usernameSave")}
          onClick={() => {
            setValue(user.username ?? "");
            setEditing(true);
          }}
          className="text-muted-foreground transition-colors hover:text-primary"
        >
          <Pencil className="size-4" />
        </button>
      </span>
    );
  }

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
        placeholder={t("auth.usernamePlaceholder")}
        className="h-9 w-44 rounded-full bg-background"
      />
      <Button
        type="submit"
        size="sm"
        disabled={value.trim().length < 2 || saving}
        className="rounded-full"
      >
        <Check className="size-4" />
        {t("profile.usernameSave")}
      </Button>
    </form>
  );
}

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

function AvatarUploader() {
  const t = useTranslations();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.accessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const forceLogout = useAuthStore((s) => s.forceLogout);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  if (!user || !token) return null;

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !token || uploading) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("profile.photoInvalid"));
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error(t("profile.photoTooLarge"));
      return;
    }
    setUploading(true);
    try {
      const path = await uploadImage(token, file);
      setUser(await updateProfile(token, { image: path }));
      toast.success(t("profile.photoUpdated"));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) forceLogout();
      else toast.error(t("auth.networkError"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <span className="relative inline-block shrink-0">
      <UserAvatar
        src={user.image}
        name={user.username || user.phone.replace(/^\+993/, "")}
        className="size-16 text-xl shadow-md"
      />
      {uploading && (
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
          <Loader2 className="size-5 animate-spin text-white" />
        </span>
      )}
      <button
        type="button"
        aria-label={t("profile.changePhoto")}
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="absolute -bottom-0.5 -right-0.5 rounded-full bg-primary p-1.5 text-white shadow-md transition-transform hover:scale-110 disabled:opacity-60"
      >
        <Camera className="size-3.5" />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => void onFileChange(e)}
      />
    </span>
  );
}

export function ProfileSection() {
  const t = useTranslations();
  const user = useAuthStore((s) => s.user);
  const booksCount = useLibraryStore((s) => s.items.length);
  const wishlistCount = useWishlistStore((s) => s.items.length);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-5 rounded-3xl bg-card p-6 shadow-xs ring-1 ring-black/3 sm:flex-row sm:items-center">
        <AvatarUploader />
        <div className="space-y-1">
          <UsernameEditor />
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Phone className="size-3.5" />
            +993 {formatPhone(user.phone.replace(/^\+993/, ""))}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/profile/balance"
          className="group rounded-3xl bg-brand-gradient p-5 text-white shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-white/80">
            <Wallet className="size-4" />
            {t("account.balance")}
          </span>
          <p className="mt-2 text-2xl font-extrabold">
            {user.balance}{" "}
            <span className="text-base font-semibold text-white/80">
              {t("common.manat")}
            </span>
          </p>
          <span className="mt-3 inline-block text-xs font-semibold text-white/90">
            {t("balance.topUp")} ›
          </span>
        </Link>

        <Link
          href="/profile/books"
          className="rounded-3xl bg-card p-5 shadow-xs ring-1 ring-black/3 transition-transform hover:-translate-y-0.5"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <LibraryBig className="size-4" />
            {t("account.myBooks")}
          </span>
          <p className="mt-2 text-2xl font-extrabold">{booksCount}</p>
        </Link>

        <Link
          href="/wishlist"
          className="rounded-3xl bg-card p-5 shadow-xs ring-1 ring-black/3 transition-transform hover:-translate-y-0.5"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="text-base leading-none">♡</span>
            {t("account.wishlist")}
          </span>
          <p className="mt-2 text-2xl font-extrabold">{wishlistCount}</p>
        </Link>
      </div>

      {/* <div className="flex flex-col gap-3 rounded-3xl bg-card p-6 shadow-xs ring-1 ring-black/3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">{t("account.language")}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t("account.languageDesc")}
          </p>
        </div>
        <LanguageSwitcher />
      </div> */}
    </div>
  );
}
