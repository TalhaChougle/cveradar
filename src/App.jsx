import React, { useState, useRef, useCallback, useEffect } from 'react'
import TopBar from './components/TopBar.jsx'
import SearchBar from './components/SearchBar.jsx'
import CVECard from './components/CVECard.jsx'
import DetailPanel from './components/DetailPanel.jsx'
import { SkeletonList } from './components/Skeleton.jsx'
import { useSearch } from './hooks/useSearch.js'
import { useLatestCVEs } from './hooks/useLatestCVEs.js'
import styles from './App.module.css'

export default function App() {
  const { results, total, loading, error, search, loadMore, hasMore, kevSet } = useSearch()
  const { items: latestItems, loading: latestLoading, loadMore: loadMoreLatest, hasMore: latestHasMore, total: latestTotal } = useLatestCVEs()

  const [selected,    setSelected]    = useState(null)
  const [view,        setView]        = useState('list')
  const [hasSearched, setHasSearched] = useState(false)
  const listRef = useRef(null)

  const displayItems   = hasSearched ? results      : latestItems
  const displayLoading = hasSearched ? loading      : latestLoading
  const displayHasMore = hasSearched ? hasMore      : latestHasMore
  const displayLoadMore = hasSearched ? loadMore    : loadMoreLatest
  const displayTotal   = hasSearched ? total        : latestTotal
  const isLatestMode   = !hasSearched

  const handleSearch = useCallback((params) => {
    setHasSearched(true)
    setSelected(null)
    setView('list')
    search({ ...params, pageNum: 0 })
  }, [search])

  const handleSelect = useCallback((cve) => {
    setSelected(cve)
    setView('detail')
  }, [])

  const handleBack = useCallback(() => {
    setView('list')
    setSelected(null)
  }, [])

  // Android back button
  useEffect(() => {
    const onPop = () => { if (view === 'detail') { setView('list'); setSelected(null) } }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [view])

  useEffect(() => {
    if (view === 'detail') window.history.pushState({ view: 'detail' }, '')
  }, [view])

  // Infinite scroll
  const handleScroll = useCallback(() => {
    const el = listRef.current
    if (!el || displayLoading || !displayHasMore) return
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 280) {
      if (hasSearched) {
        loadMore()
      } else {
        loadMoreLatest()
      }
    }
  }, [displayLoading, displayHasMore, hasSearched, loadMore, loadMoreLatest])

  const isKev = selected && kevSet ? kevSet.has(selected.id) : false

  return (
    <div className={styles.app}>
      <TopBar loading={displayLoading} />
      <SearchBar
        onSearch={handleSearch}
        loading={loading}
        total={displayTotal}
        hasResults={true}
      />

      <div className={`${styles.main} ${view === 'detail' ? styles.detailView : ''}`}>

        <div className={`${styles.listPane} ${view === 'detail' ? styles.listCollapsed : ''}`}
          ref={listRef} onScroll={handleScroll}>

          {isLatestMode && !displayLoading && displayItems.length > 0 && (
            <div className={styles.listHdr}>
              <span>Latest CVEs</span>
              <span className={styles.listSub}>auto-refreshing · scroll to browse</span>
            </div>
          )}

          {hasSearched && displayItems.length > 0 && (
            <div className={styles.listHdr}>
              <span>{total.toLocaleString()} CVEs found</span>
              <span className={styles.listSub}>{results.length} loaded · scroll for more</span>
            </div>
          )}

          {displayLoading && displayItems.length === 0 && <SkeletonList count={12} />}

          {error && (
            <div className={styles.error}>
              <svg viewBox="0 0 16 16" fill="none" width="14" style={{flexShrink:0}}>
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          {displayItems.map(cve => (
            <CVECard
              key={cve.id}
              cve={cve}
              selected={selected?.id === cve.id}
              onSelect={() => handleSelect(cve)}
              isKev={kevSet ? kevSet.has(cve.id) : false}
              compact={view === 'detail'}
            />
          ))}

          {hasSearched && loading && displayItems.length > 0 && <SkeletonList count={3} />}

          {hasSearched && !loading && !hasMore && results.length > 0 && (
            <div className={styles.endMsg}>— all {results.length.toLocaleString()} loaded —</div>
          )}

          {hasSearched && !loading && results.length === 0 && !error && (
            <div className={styles.noResults}>
              <svg viewBox="0 0 48 48" fill="none" width="30">
                <circle cx="22" cy="22" r="16" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M33 33L43 43" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p>No CVEs found. Try a different query.</p>
            </div>
          )}
        </div>

        <div className={`${styles.detailPane} ${view === 'detail' ? styles.detailExpanded : ''}`}>
          <DetailPanel cve={selected} isKev={isKev} onBack={handleBack} showBack={view === 'detail'} />
        </div>
      </div>
    </div>
  )
}
