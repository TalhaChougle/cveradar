import { useState, useEffect, useCallback } from 'react'
import { searchCVEs } from '../utils/nvd.js'

const PAGE_SIZE = 100  // Load 100 CVEs per page
const POLL_MS = 5 * 60 * 1000   // re-poll every 5 min for updates

// Sort CVEs by CVSS score (highest to lowest)
function sortByScore(items) {
  return [...items].sort((a, b) => {
    const scoreA = a.score ?? 0
    const scoreB = b.score ?? 0
    return scoreB - scoreA
  })
}

// Loads all recent CVEs with pagination and auto-refresh for updates
export function useLatestCVEs() {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [page,    setPage]    = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [total,   setTotal]   = useState(0)

  const loadMore = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      // Load the next page (no query = latest CVEs sorted by publication date)
      const data = await searchCVEs({
        query: '',
        resultsPerPage: PAGE_SIZE,
        startIndex: page * PAGE_SIZE,
      })
      
      setTotal(data.total)
      
      if (silent) {
        // Check for new/updated CVEs and merge at the top (de-dupe by id), then sort
        setItems(prev => {
          const existingIds = new Set(prev.map(r => r.id))
          const fresh = data.items.filter(r => !existingIds.has(r.id))
          const merged = fresh.length ? [...fresh, ...prev] : prev
          return sortByScore(merged)
        })
      } else {
        const combined = page === 0 ? data.items : [...items, ...data.items]
        setItems(sortByScore(combined))
        setPage(prev => prev + 1)
      }
      
      // Update hasMore based on total results
      setHasMore(items.length + data.items.length < data.total)
    } catch {
      // silently fail — user can still search manually
    } finally {
      if (!silent) setLoading(false)
    }
  }, [page, items.length])

  // Initial load
  useEffect(() => {
    loadMore(false)
  }, [])

  // Auto-refresh every 5 minutes to check for new/updated CVEs
  useEffect(() => {
    const timer = setInterval(() => {
      loadMore(true)
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [loadMore])

  return { items, loading, loadMore, hasMore, total }
}
