// src/components/dashboard/log-ride-modal.tsx
'use client'

import { useEffect, useRef, useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { logRide, searchCoasters, type CoasterSearchResult } from '@/actions/rides'

const INK = '#17233C'
const CREAM = '#F5EEDA'
const CARD = '#FBF7EC'
const LINE = '#C9BC98'
const RAIL = '#3E5C82'
const TICKET_RED = '#C6382A'

const MIN_QUERY_LENGTH = 2
const SEARCH_DEBOUNCE_MS = 300

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3 3l10 10M13 3L3 13" />
    </svg>
  )
}

const inputClass =
  'w-full rounded-sm border bg-[#FFFDF7] px-3 py-2 text-sm text-[#17233C] placeholder:text-[#8B8368] outline-none transition focus:border-[#3E5C82] focus:ring-2 focus:ring-[#3E5C82]/20 border-[#C9BC98]'
const labelClass = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#17233C]'

/**
 * Self-contained trigger + dialog: dropping `<LogRideModal />` anywhere
 * renders both its own "+ Log a Ride" button and the modal, so the parent
 * page doesn't need to manage open/closed state itself.
 *
 * Note: this handles focus-on-open and Escape-to-close, but does not
 * implement a full focus trap (Tab cycling back inside the dialog) — that's
 * a reasonable follow-up if accessibility auditing calls for it, but is
 * more machinery than this phase's scope needs.
 */
export function LogRideModal() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<CoasterSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCoaster, setSelectedCoaster] = useState<CoasterSearchResult | null>(null)
  const [riddenAt, setRiddenAt] = useState(todayDateString)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const searchInputRef = useRef<HTMLInputElement>(null)
  const latestQueryRef = useRef('')

  useEffect(() => {
    if (!open) return

    searchInputRef.current?.focus()
    document.body.style.overflow = 'hidden'

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Debounced live search, guarded against out-of-order responses landing
  // after a more recent keystroke's request.
  useEffect(() => {
    const term = searchTerm.trim()
    latestQueryRef.current = term

    if (selectedCoaster || term.length < MIN_QUERY_LENGTH) {
      setResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const timeoutId = setTimeout(() => {
      searchCoasters(term).then((result) => {
        if (latestQueryRef.current !== term) return // stale response, discard
        setIsSearching(false)
        setResults(result.success ? (result.data ?? []) : [])
      })
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedCoaster])

  function resetForm() {
    setSearchTerm('')
    setResults([])
    setSelectedCoaster(null)
    setRiddenAt(todayDateString())
    setNotes('')
    setError(null)
  }

  function handleClose() {
    setOpen(false)
    resetForm()
  }

  function handleSelectCoaster(coaster: CoasterSearchResult) {
    setSelectedCoaster(coaster)
    setSearchTerm('')
    setResults([])
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!selectedCoaster) {
      setError('Pick a coaster from the search results first.')
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await logRide({
        coaster_id: selectedCoaster.id,
        ridden_at: riddenAt,
        notes: notes.trim() || undefined,
      })

      if (!result.success) {
        setError(result.error ?? 'Something went wrong. Please try again.')
        return
      }

      handleClose()
      // logRide already revalidates the cache; refresh forces this
      // already-mounted page to re-fetch immediately instead of waiting
      // for the next navigation.
      router.refresh()
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-sm px-4 py-2 text-sm font-semibold uppercase tracking-[0.1em] text-[#FBF7EC] transition hover:bg-[#A92E22]"
        style={{ backgroundColor: TICKET_RED }}
      >
        + Log a Ride
      </button>

      {open && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={handleClose}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="log-ride-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-sm"
            style={{ backgroundColor: CARD, border: `1px solid ${LINE}` }}
          >
            <div className="flex items-center justify-between px-5 py-3" style={{ backgroundColor: INK }}>
              <h2
                id="log-ride-title"
                className="text-sm font-semibold uppercase tracking-[0.15em]"
                style={{ color: CREAM }}
              >
                Log a Ride
              </h2>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="rounded-sm p-1 transition hover:bg-white/10"
                style={{ color: CREAM }}
              >
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-sm border-l-4 bg-[#FBEAE7] px-3 py-2.5 text-sm text-[#8A2A1E]"
                  style={{ borderColor: TICKET_RED }}
                >
                  <span aria-hidden className="mt-0.5">
                    &#9888;
                  </span>
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="coaster-search" className={labelClass}>
                  Coaster
                </label>

                {selectedCoaster ? (
                  <div
                    className="flex items-center justify-between rounded-sm border px-3 py-2 text-sm"
                    style={{ borderColor: LINE, backgroundColor: '#FFFDF7' }}
                  >
                    <span style={{ color: INK }}>
                      {selectedCoaster.name} <span className="text-[#8B8368]">— {selectedCoaster.park}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedCoaster(null)}
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: RAIL }}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      id="coaster-search"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by coaster or park name…"
                      autoComplete="off"
                      className={inputClass}
                    />

                    {searchTerm.trim().length >= MIN_QUERY_LENGTH && (
                      <ul
                        className="absolute z-10 mt-1 max-h-52 w-full overflow-y-auto rounded-sm border shadow-md"
                        style={{ borderColor: LINE, backgroundColor: '#FFFDF7' }}
                      >
                        {isSearching && <li className="px-3 py-2 text-sm text-[#8B8368]">Searching…</li>}
                        {!isSearching && results.length === 0 && (
                          <li className="px-3 py-2 text-sm text-[#8B8368]">No coasters found.</li>
                        )}
                        {!isSearching &&
                          results.map((coaster) => (
                            <li key={coaster.id}>
                              <button
                                type="button"
                                onClick={() => handleSelectCoaster(coaster)}
                                className="block w-full px-3 py-2 text-left text-sm transition hover:bg-[#EFE6CC]"
                              >
                                <span style={{ color: INK }}>{coaster.name}</span>{' '}
                                <span className="text-[#8B8368]">— {coaster.park}</span>
                              </button>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="ridden-at" className={labelClass}>
                  Date ridden
                </label>
                <input
                  id="ridden-at"
                  type="date"
                  required
                  value={riddenAt}
                  max={todayDateString()}
                  onChange={(e) => setRiddenAt(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="notes" className={labelClass}>
                  Notes <span className="normal-case text-[#8B8368]">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Front row, night ride, first airtime hill…"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={isPending || !selectedCoaster}
                className="w-full rounded-sm py-2.5 text-sm font-semibold uppercase tracking-[0.15em] text-[#FBF7EC] transition hover:bg-[#A92E22] disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: TICKET_RED }}
              >
                {isPending ? 'Punching ticket…' : 'Log Ride'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
