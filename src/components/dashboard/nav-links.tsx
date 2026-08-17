"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history", label: "Ride History" },
  { href: "/catalog", label: "Catalog" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/settings", label: "Settings" },
] as const;

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="shrink-0 rounded-sm px-3 py-1.5 text-sm font-medium transition"
      style={
        active
          ? {
              color: "#17233C",
              backgroundColor: "#EFE6CC",
              boxShadow: "inset 0 -2px 0 #C6382A",
            }
          : { color: "#3E5C82" }
      }
    >
      {label}
    </Link>
  );
}

/**
 * Two separate exports, not one component rendering both rows: the
 * desktop nav sits inline in the header's flex row (next to the logo and
 * user chip), while the mobile nav needs to be a full-width sibling row
 * *below* it. A single component returning both via a Fragment would put
 * them wherever that one call site is, breaking whichever layout it's not
 * positioned for.
 */

export function DesktopNavLinks({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const adminActive = isActive(pathname, "/admin");

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          label={item.label}
          active={isActive(pathname, item.href)}
        />
      ))}
      {isAdmin && (
        <Link
          href="/coasters"
          aria-current={adminActive ? "page" : undefined}
          className="ml-1 flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition hover:bg-[#EFE6CC]"
          style={
            adminActive
              ? {
                  color: "#17233C",
                  backgroundColor: "#EFE6CC",
                  boxShadow: "inset 0 -2px 0 #C6382A",
                }
              : { color: "#8A6A00" }
          }
        >
          Admin
          <span
            className="rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#5C4400]"
            style={{ backgroundColor: "#E3A61E" }}
          >
            Staff
          </span>
        </Link>
      )}
    </nav>
  );
}

export function MobileNavLinks({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const adminActive = isActive(pathname, "/admin");

  return (
    <nav className="-mt-1 flex gap-1 overflow-x-auto px-4 pb-3 sm:px-6 md:hidden">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          label={item.label}
          active={isActive(pathname, item.href)}
        />
      ))}
      {isAdmin && (
        <Link
          href="/coasters"
          aria-current={adminActive ? "page" : undefined}
          className="shrink-0 rounded-sm px-3 py-1.5 text-sm font-medium transition"
          style={
            adminActive
              ? {
                  color: "#17233C",
                  backgroundColor: "#EFE6CC",
                  boxShadow: "inset 0 -2px 0 #C6382A",
                }
              : { color: "#8A6A00" }
          }
        >
          Admin
        </Link>
      )}
    </nav>
  );
}
