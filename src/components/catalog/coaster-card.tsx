// src/components/catalog/coaster-card.tsx
import { Oswald } from "next/font/google";
import { LogRideModal } from "@/components/dashboard/log-ride-modal";
import type { CatalogCoaster } from "@/actions/catalog";

const oswald = Oswald({ subsets: ["latin"], weight: ["600"] });

const INK = "#17233C";
const CARD = "#FBF7EC";
const LINE = "#C9BC98";
const MUTED = "#5B5638";
const RAIL = "#3E5C82";
const TRACK_GREEN = "#2F7A4D";
const CREAM = "#F5EEDA";

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function CoasterCard({
  coaster,
  isRidden,
}: {
  coaster: CatalogCoaster;
  isRidden: boolean;
}) {
  return (
    <div
      className="relative flex flex-col gap-3 overflow-hidden rounded-sm p-4"
      style={{ border: `1px solid ${LINE}`, backgroundColor: CARD }}
    >
      {isRidden && (
        <span
          className="absolute right-3 top-3 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{ backgroundColor: TRACK_GREEN, color: CREAM }}
        >
          &#10003; Credit Earned
        </span>
      )}

      <div className="pr-24">
        <p
          className={`${oswald.className} truncate text-lg uppercase tracking-wide`}
          style={{ color: INK }}
        >
          {coaster.name}
        </p>
        <p className="truncate text-sm" style={{ color: MUTED }}>
          {coaster.park} &middot; {coaster.country}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span
          className="rounded-sm px-2 py-1 font-medium"
          style={{ border: `1px solid ${LINE}`, color: RAIL }}
        >
          {capitalize(coaster.type)}
        </span>
        <span className="truncate" style={{ color: MUTED }}>
          {coaster.manufacturer}
        </span>
      </div>

      <div className="mt-auto pt-1">
        <LogRideModal
          initialCoaster={coaster}
          triggerLabel="Log Ride"
          triggerClassName="inline-flex w-full items-center justify-center gap-2 rounded-sm px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#FBF7EC] transition hover:bg-[#A92E22]"
        />
      </div>
    </div>
  );
}
