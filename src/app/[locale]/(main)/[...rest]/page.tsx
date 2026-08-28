import { notFound } from "next/navigation";

// Catch-all: any unknown path under a valid locale renders the localized
// not-found page.
export default function CatchAllPage() {
  notFound();
}
