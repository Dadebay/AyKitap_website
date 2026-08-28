import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip api, Next internals and all static files (anything with a dot,
  // e.g. /flags/tm.svg — "tm" would otherwise collide with the locale).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
