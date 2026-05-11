import { useState, useCallback, useRef, useEffect } from 'react'
import { searchCVEs, fetchKEV } from '../utils/nvd.js'

const POLL_MS = 5 * 60 * 1000   // re-poll every 5 min when idle

export function useSearch() {
  const [results, setResults]       = useState([])
  const [total,   setTotal]         = useState(0)
  const [loading, setLoading]       = useState(false)
  const [error,   setError]         = useState(null)
  const [page,    setPage]          = useState(0)
  const [lastQuery, setLastQuery]   = useState(null)
  const [kevSet,  setKevSet]        = useState(null)
  const abortRef  = useRef(null)
  const pollTimer = useRef(null)

  // Lazy-load KEV catalog once
  useEffect(() => {
    fetchKEV().then(k => setKevSet(k)).catch(() => setKevSet(new Set()))
  }, [])

  const _doSearch = useCallback(async ({ query, severity, year, pageNum = 0 }, silent = false) => {
    if (abortRef.current) abortRef.current.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    if (!silent) {
      setLoading(true)
      setError(null)
      if (pageNum === 0) setResults([])
    }

    try {
      const data = await searchCVEs({ query, severity, year, startIndex: pageNum * 20, resultsPerPage: 20 })
      if (ctrl.signal.aborted) return

      setTotal(data.total)
      if (silent) {
        // Merge new items at the top (de-dupe by id)
        setResults(prev => {
          const existingIds = new Set(prev.map(r => r.id))
          const fresh = data.items.filter(r => !existingIds.has(r.id))
          return fresh.length ? [...fresh, ...prev] : prev
        })
      } else {
        setResults(prev => pageNum === 0 ? data.items : [...prev, ...data.items])
      }
      setPage(pageNum)
      setLastQuery({ query, severity, year })
    } catch (err) {
      if (err.name === 'AbortError') return
      if (!silent) setError(err.message || 'Something went wrong.')
    } finally {
      if (!ctrl.signal.aborted && !silent) setLoading(false)
    }
  }, [])

  const search = useCallback((params) => {
    clearInterval(pollTimer.current)
    _doSearch(params, false)
    // Set up auto-refresh for the same query
    pollTimer.current = setInterval(() => {
      _doSearch(params, true)
    }, POLL_MS)
  }, [_doSearch])

  const loadMore = useCallback(() => {
    if (!lastQuery || loading) return
    _doSearch({ ...lastQuery, pageNum: page + 1 }, false)
  }, [lastQuery, loading, page, _doSearch])

  // Cleanup on unmount
  useEffect(() => () => {
    clearInterval(pollTimer.current)
    abortRef.current?.abort()
  }, [])

  return {
    results,
    total,
    loading,
    error,
    search,
    loadMore,
    hasMore: results.length < total,
    kevSet,
  }
}
