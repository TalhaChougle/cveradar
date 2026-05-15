import { useState, useEffect, useCallback } from 'react'
import { searchCVEs } from '../utils/nvd.js'

const PAGE_SIZE = 50  // Load 50 CVEs per page (faster than 100)
const POLL_MS = 5 * 60 * 1000   // re-poll every 5 min for updates

// Sort CVEs by published date (newest to oldest)
function sortByDate(items) {
  return [...items].sort((a, b) => {
    if (a.published === b.published) return 0
    if (!a.published) return 1
    if (!b.published) return -1
    return b.published.localeCompare(a.published)
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
        // Check for new/updated CVEs, sort them, then merge with existing (de-dupe)
        setItems(prev => {
          const existingIds = new Set(prev.map(r => r.id))
          const fresh = data.items.filter(r => !existingIds.has(r.id))
          if (!fresh.length) return prev
          // Sort fresh items and place at top
          return [...sortByDate(fresh), ...prev]
        })
      } else {
        // First load or load more - sort new batch before merging
        const sortedNew = sortByDate(data.items)
        setItems(prev => {
          if (page === 0) return sortedNew
          // Merge and sort all to maintain order
          return sortByDate([...prev, ...sortedNew])
        })
        setPage(prev => prev + 1)
      }
      
      // Update hasMore based on total results
      setHasMore((page + 1) * PAGE_SIZE < data.total)
    } catch {
      // silently fail — user can still search manually
    } finally {
      if (!silent) setLoading(false)
    }
  }, [page])

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
