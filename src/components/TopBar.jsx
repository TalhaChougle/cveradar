import React from 'react'
import styles from './TopBar.module.css'

export default function TopBar({ loading }) {
  return (
    <header className={styles.bar}>
      <div className={styles.brand}>
        <div className={styles.icon}>
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M10 2L3 5.5V10c0 4.5 3.1 7.5 7 9 3.9-1.5 7-4.5 7-9V5.5L10 2z" fill="currentColor"/>
            <path d="M7 10l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className={styles.title}>CVE<span>Radar</span></span>
      </div>

      <div className={styles.right}>
        {loading && (
          <span className={styles.searching}>
            <span className={styles.spinner}/>
            <span className={styles.searchingText}>querying NVD…</span>
          </span>
        )}
        <span className={styles.pill}>
          <span className={styles.dot}/>
          <span>NVD Live</span>
        </span>
        <a className={`${styles.pill} ${styles.pillLink}`}
          href="https://nvd.nist.gov" target="_blank" rel="noopener noreferrer">
          <span className={styles.pillFull}>NIST · CISA · MITRE</span>
          <span className={styles.pillShort}>NIST</span>
        </a>
      </div>
    </header>
  )
}
