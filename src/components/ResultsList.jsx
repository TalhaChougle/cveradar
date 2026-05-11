import React, { useRef, useEffect } from 'react'
import CVECard from './CVECard.jsx'
import styles from './ResultsList.module.css'

function SkeletonCard() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skRow}>
        <div className={`${styles.skBox} ${styles.skId}`} />
        <div className={`${styles.skBox} ${styles.skSev}`} />
        <div className={`${styles.skBox} ${styles.skScore}`} />
      </div>
      <div className={`${styles.skBox} ${styles.skDesc1}`} />
      <div className={`${styles.skBox} ${styles.skDesc2}`} />
      <div className={styles.skRow}>
        <div className={`${styles.skBox} ${styles.skTag}`} />
        <div className={`${styles.skBox} ${styles.skDate}`} />
      </div>
    </div>
  )
}

export default function ResultsList({ results, loading, error, total, hasMore, onLoadMore, selectedId, onSelect, kevSet }) {
  const sentinelRef = useRef(null)

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!hasMore || loading) return
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) onLoadMore()
    }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore, loading, onLoadMore])

  if (error) return (
    <div className={styles.state}>
      <div className={styles.errorIcon}>!</div>
      <p className={styles.stateTitle}>Query failed</p>
      <p className={styles.stateMsg}>{error}</p>
    </div>
  )

  if (!loading && results.length === 0) return (
    <div className={styles.state}>
      <div className={styles.emptyIcon}>
        <svg viewBox="0 0 32 32" fill="none">
          <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M21 21L28 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M10 14h8M14 10v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <p className={styles.stateTitle}>Search for vulnerabilities</p>
      <p className={styles.stateMsg}>Enter a CVE ID or keyword — e.g. <code>log4j</code>, <code>openssl</code>, <code>CVE-2021-44228</code></p>
      <div className={styles.examples}>
        {['CVE-2021-44228', 'CVE-2024-3400', 'log4shell', 'spring4shell', 'heartbleed'].map(ex => (
          <span key={ex} className={styles.exChip} onClick={() => onSelect && onSelect(ex)}>
            {ex}
          </span>
        ))}
      </div>
    </div>
  )

  return (
    <div className={styles.list}>
      <div className={styles.listHdr}>
        {results.length > 0
          ? `${results.length} / ${total.toLocaleString()} results`
          : loading ? 'Searching…' : ''}
      </div>

      {results.map(cve => (
        <CVECard
          key={cve.id}
          cve={cve}
          selected={cve.id === selectedId}
          onSelect={() => onSelect(cve)}
          isKev={kevSet?.has(cve.id) ?? false}
        />
      ))}

      {loading && (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      )}

      {hasMore && !loading && (
        <div ref={sentinelRef} className={styles.loadMore} onClick={onLoadMore}>
          Load more
        </div>
      )}
    </div>
  )
}
