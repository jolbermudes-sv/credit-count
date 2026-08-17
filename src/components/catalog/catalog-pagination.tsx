// src/components/catalog/catalog-pagination.tsx
import Link from "next/link";

const INK = "#17233C";
const LINE = "#C9BC98";
const CARD = "#FBF7EC";
const MUTED = "#5B5638";
const RAIL = "#3E5C82";
const CREAM = "#F5EEDA";

interface CatalogPaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

function buildHref(
  page: number,
  searchParams: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value) params.set(key, value);
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  const qs = params.toString();
  return qs ? `/catalog?${qs}` : "/catalog";
}

/** Builds a compact page-number list with ellipses, e.g. 1 … 4 5 [6] 7 8 … 20 */
function buildPageNumbers(current: number, total: number): (number | null)[] {
  const delta = 2;
  const range: number[] = [];
  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(total - 1, current + delta);
    i++
  ) {
    range.push(i);
  }

  const pages: (number | null)[] = [1];
  if (range[0] > 2) pages.push(null);
  pages.push(...range);
  if (range[range.length - 1] < total - 1) pages.push(null);
  pages.push(total);

  return pages;
}

function PageLink({
  page,
  label,
  active,
  disabled,
  searchParams,
}: {
  page: number;
  label: string;
  active?: boolean;
  disabled?: boolean;
  searchParams: Record<string, string | undefined>;
}) {
  if (disabled) {
    return (
      <span
        className="rounded-sm px-3 py-1.5 text-sm font-medium"
        style={{ color: MUTED, opacity: 0.5 }}
        aria-disabled="true"
      >
        {label}
      </span>
    );
  }

  return (
    <Link
      href={buildHref(page, searchParams)}
      aria-current={active ? "page" : undefined}
      aria-label={active ? undefined : `Go to page ${page}`}
      className="rounded-sm px-3 py-1.5 text-sm font-medium transition"
      style={
        active
          ? { backgroundColor: INK, color: CREAM }
          : { color: RAIL, border: `1px solid ${LINE}`, backgroundColor: CARD }
      }
    >
      {label}
    </Link>
  );
}

/**
 * A plain Server Component: pagination here is just links with different
 * `page` query params, so there's no need for client JS, `useSearchParams`,
 * or a Suspense boundary — `<Link>` navigation alone re-triggers the page's
 * server-side data fetch with the new searchParams.
 */
export function CatalogPagination({
  currentPage,
  totalPages,
  searchParams,
}: CatalogPaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = buildPageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label="Catalog pages"
      className="flex flex-wrap items-center justify-center gap-1 pt-2"
    >
      <PageLink
        page={currentPage - 1}
        disabled={currentPage <= 1}
        searchParams={searchParams}
        label="Prev"
      />

      {pageNumbers.map((page, i) =>
        page === null ? (
          <span
            key={`ellipsis-${i}`}
            className="px-2 text-sm"
            style={{ color: MUTED }}
          >
            &hellip;
          </span>
        ) : (
          <PageLink
            key={page}
            page={page}
            active={page === currentPage}
            searchParams={searchParams}
            label={String(page)}
          />
        ),
      )}

      <PageLink
        page={currentPage + 1}
        disabled={currentPage >= totalPages}
        searchParams={searchParams}
        label="Next"
      />
    </nav>
  );
}
