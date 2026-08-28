/** 33612 -> "33.6K", 1740 -> "1.7K", 950 -> "950" */
export function formatCount(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(n);
}

/** OTP resend countdown: 13 -> "0:13" */
export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** 2703142 -> "2.6 MB" */
export function formatBytes(bytes: number): string {
  if (!bytes || bytes < 1024) return `${bytes || 0} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

/** "61234567" -> "61 23 45 67" (Turkmen 8-digit numbers) */
export function formatPhone(digits: string): string {
  return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}
