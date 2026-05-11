import React, { useState, useRef, useEffect } from 'react'
import styles from './SearchBar.module.css'

const SEVERITIES = ['all','critical','high','medium','low']
const YEARS      = ['2025','2024','2023','2022','2021']

const EXAMPLES = [
  'CVE-2021-44228','CVE-2024-3400','log4shell','openssl',
  'apache httpd','spring4shell','CVE-2023-44487','log4j',
  'nginx','kubernetes','CVE-2024-6387',
]

export default function SearchBar({ onSearch, loading, total, hasResults }) {
  const [query,    setQuery]    = useState('')
  const [severity, setSeverity] = useState('all')
  const [year,     setYear]     = useState('')
  const [ph,       setPh]       = useState(EXAMPLES[0])
  const inputRef = useRef(null)
  const phIdx    = useRef(0)

  useEffect(() => {
    const t = setInterval(() => {
      phIdx.current = (phIdx.current + 1) % EXAMPLES.length
      setPh(EXAMPLES[phIdx.current])
    }, 2800)
    return () => clearInterval(t)
  }, [])

  const submit = () => {
    if (!query.trim()) return
    onSearch({ query, severity: severity === 'all' ? null : severity, year: year || null })
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <div className={styles.inputWrap}>
          <span className={styles.searchIcon}>
            <svg viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </span>
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder={ph}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            enterKeyHint="search"
          />
          {query && (
            <button className={styles.clear} onClick={() => { setQuery(''); inputRef.current?.focus() }}>×</button>
          )}
        </div>
        <button className={styles.btn} onClick={submit} disabled={loading || !query.trim()}>
          {loading ? <span className={styles.spinner}/> : 'Search'}
        </button>
      </div>

      <div className={styles.filters}>
        <div className={styles.group}>
          {SEVERITIES.map(s => (
            <button
              key={s}
              className={`${styles.chip} ${severity === s ? styles.on : ''} ${s !== 'all' ? styles[s] : ''}`}
              onClick={() => setSeverity(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <div className={styles.divider}/>

        <div className={`${styles.group} ${styles.yearGroup}`}>
          {YEARS.map(y => (
            <button
              key={y}
              className={`${styles.chip} ${year === y ? styles.on : ''}`}
              onClick={() => setYear(p => p === y ? '' : y)}
            >
              {y}
            </button>
          ))}
        </div>

        {hasResults && (
          <span className={styles.count}>{total.toLocaleString()} results</span>
        )}
      </div>
    </div>
  )
}
