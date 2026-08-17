// src/components/catalog/catalog-filters.tsx
"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CatalogFilterOptions } from "@/actions/catalog";

const SEARCH_DEBOUNCE_MS = 400;

const RAIL = "#3E5C82";

const fieldClass =
  "rounded-sm border bg-[#FFFDF7] px-3 py-2 text-sm text-[#17233C] outline-none transition focus:border-[#3E5C82] focus:ring-2 focus:ring-[#3E5C82]/20 border-[#C9BC98]";

const COASTER_TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "steel", label: "Steel" },
  { value: "wooden", label: "Wooden" },
  { value: "hybrid", label: "Hybrid" },
  { value: "other", label: "Other" },
] as const;

export function CatalogFilters({
  filterOptions,
}: {
  filterOptions: CatalogFilterOptions;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") ?? "",
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the input in sync if the URL changes from elsewhere (e.g. the
  // "Clear filters" button, or browser back/forward navigation).
  useEffect(() => {
    setSearchInput(searchParams.get("search") ?? "");
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function pushParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    params.delete("page"); // any filter change invalidates the current page
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  function handleSearchInputChange(value: string) {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushParams({ search: value.trim() || null });
    }, SEARCH_DEBOUNCE_MS);
  }

  const hasActiveFilters = Boolean(
    searchParams.get("search") ||
    searchParams.get("type") ||
    searchParams.get("country") ||
    searchParams.get("manufacturer"),
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="text"
        value={searchInput}
        onChange={(e) => handleSearchInputChange(e.target.value)}
        placeholder="Search by name or park…"
        className={`${fieldClass} min-w-[14rem] flex-1`}
        aria-label="Search coasters"
      />

      <select
        value={searchParams.get("type") ?? ""}
        onChange={(e) => pushParams({ type: e.target.value || null })}
        className={fieldClass}
        aria-label="Filter by type"
      >
        {COASTER_TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("country") ?? ""}
        onChange={(e) => pushParams({ country: e.target.value || null })}
        className={fieldClass}
        aria-label="Filter by country"
      >
        <option value="">All countries</option>
        {filterOptions.countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("manufacturer") ?? ""}
        onChange={(e) => pushParams({ manufacturer: e.target.value || null })}
        className={fieldClass}
        aria-label="Filter by manufacturer"
      >
        <option value="">All manufacturers</option>
        {filterOptions.manufacturers.map((manufacturer) => (
          <option key={manufacturer} value={manufacturer}>
            {manufacturer}
          </option>
        ))}
      </select>

      {isPending && (
        <span className="text-xs" style={{ color: RAIL }}>
          Updating…
        </span>
      )}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => {
            setSearchInput("");
            startTransition(() => router.push(pathname));
          }}
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: RAIL }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
