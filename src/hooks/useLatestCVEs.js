import { useState, useEffect } from 'react'
import { searchCVEs } from '../utils/nvd.js'

// Loads the most recent CVEs on startup, keeps refreshing
export function useLatestCVEs() {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        // Get the 40 most recently published CVEs (no keyword = latest)
        const data = await searchCVEs({
          query: '',
          resultsPerPage: 40,
          startIndex: 0,
        })
        if (!cancelled) setItems(data.items)
      } catch {
        // silently fail — user can still search manually
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    // Refresh every 3 minutes
    const t = setInterval(load, 3 * 60 * 1000)
    return () => { cancelled = true; clearInterval(t) }
  }, [])

  return { items, loading }
}
