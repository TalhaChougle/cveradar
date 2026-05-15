import { useState, useEffect, useCallback, useRef } from 'react'
import { searchCVEs } from '../utils/nvd.js'

const PAGE_SIZE = 20
const POLL_MS   = 5 * 60 * 1000

function getDateRange() {
  const end   = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)  // last 30 days
  const fmt = (d) => d.toISOString().slice(0, 10)
  return { start: fmt(start), end: fmt(end) }
}

export function useLatestCVEs() {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [page,    setPage]    = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [total,   setTotal]   = useState(0)
  const pageRef = useRef(0)

  const load = useCallback(async (pageNum = 0, silent = false) => {
    try {
      if (!silent) setLoading(true)
      const { start, end } = getDateRange()
      const data = await searchCVEs({
        query: '',
        resultsPerPage: PAGE_SIZE,
        startIndex: pageNum * PAGE_SIZE,
        yearFilter: null,
        pubStartDate: start,
        pubEndDate: end,
      })
      setTotal(data.total)
      setHasMore((pageNum + 1) * PAGE_SIZE < data.total)
      if (silent) {
        setItems(prev => {
          const existingIds = new Set(prev.map(r => r.id))
          const fresh = data.items.filter(r => !existingIds.has(r.id))
          return fresh.length ? [...fresh, ...prev] : prev
        })
      } else {
        setItems(prev => pageNum === 0 ? data.items : [...prev, ...data.items])
        pageRef.current = pageNum + 1
        setPage(pageNum + 1)
      }
    } catch {
      // silently fail
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => { load(0, false) }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      const timer = setInterval(() => load(0, true), POLL_MS)
      return () => clearInterval(timer)
    }, 30000)
    return () => clearTimeout(t)
  }, [load])

  const loadMore = useCallback(() => {
    load(pageRef.current, false)
  }, [load])

  return { items, loading, loadMore, hasMore, total }
}