import { Suspense } from "react";
import {
  getCatalogCoasters,
  getCatalogFilterOptions,
  getUserRiddenCoasterSet,
} from "@/actions/catalog";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { CoasterCard } from "@/components/catalog/coaster-card";
import { CatalogPagination } from "@/components/catalog/catalog-pagination";

interface CatalogPageProps {
  searchParams: Promise<{
    search?: string;
    type?: string;
    country?: string;
    manufacturer?: string;
    page?: string;
  }>;
}

function parsePageParam(value: string | undefined): number {
  const n = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const sp = await searchParams;
  const page = parsePageParam(sp.page);

  const [filterOptionsResult, riddenResult, catalogResult] = await Promise.all([
    getCatalogFilterOptions(),
    getUserRiddenCoasterSet(),
    getCatalogCoasters({
      search: sp.search,
      type: sp.type,
      country: sp.country,
      manufacturer: sp.manufacturer,
      page,
    }),
  ]);

  const filterOptions =
    filterOptionsResult.success && filterOptionsResult.data
      ? filterOptionsResult.data
      : { countries: [], manufacturers: [] };

  const riddenIds = new Set(
    riddenResult.success ? (riddenResult.data ?? []) : [],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-ink)]">
          Coaster Catalog
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Browse the catalog and log a ride straight from here.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="h-11 rounded-sm border border-[var(--color-line)] bg-[var(--color-card)]" />
        }
      >
        <CatalogFilters filterOptions={filterOptions} />
      </Suspense>

      {!catalogResult.success || !catalogResult.data ? (
        <div className="rounded-sm border border-[var(--color-line)] bg-[var(--color-card)] px-6 py-8 text-center">
          <p className="text-sm text-[#8A2A1E]">
            {catalogResult.error ??
              "We couldn't load the catalog. Please refresh the page."}
          </p>
        </div>
      ) : catalogResult.data.coasters.length === 0 ? (
        <div className="rounded-sm border-2 border-dashed border-[var(--color-line)] bg-[var(--color-card)] px-6 py-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[var(--color-rail)]">
            No Matches
          </p>
          <p className="mt-2 text-lg text-[var(--color-ink)]">
            No coasters match your filters.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-[var(--color-muted)]">
            {catalogResult.data.totalCount} coaster
            {catalogResult.data.totalCount === 1 ? "" : "s"} found.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catalogResult.data.coasters.map((coaster) => (
              <CoasterCard
                key={coaster.id}
                coaster={coaster}
                isRidden={riddenIds.has(coaster.id)}
              />
            ))}
          </div>

          <CatalogPagination
            currentPage={catalogResult.data.page}
            totalPages={catalogResult.data.totalPages}
            searchParams={{
              search: sp.search,
              type: sp.type,
              country: sp.country,
              manufacturer: sp.manufacturer,
            }}
          />
        </>
      )}
    </div>
  );
}
