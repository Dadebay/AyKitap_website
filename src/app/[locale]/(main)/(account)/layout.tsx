import type { ReactNode } from "react";
import { AccountShell } from "@/components/account/account-shell";

// Shared shell for every account section (profile, library, wishlist,
// balance, requests, support): sidebar on the left, section on the right.
export default function AccountLayout({ children }: { children: ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
