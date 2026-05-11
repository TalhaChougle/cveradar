import React from 'react'
import styles from './EmptyState.module.css'

const QUICK = [
  { label: 'Log4Shell',           q: 'CVE-2021-44228' },
  { label: 'Spring4Shell',        q: 'CVE-2022-22965' },
  { label: 'HTTP/2 Rapid Reset',  q: 'CVE-2023-44487' },
  { label: 'MOVEit Transfer',     q: 'CVE-2023-34362' },
  { label: 'CitrixBleed',         q: 'CVE-2023-4966'  },
  { label: 'RegreSSHion',         q: 'CVE-2024-6387'  },
]

export default function EmptyState({ onQuick }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>
        <svg viewBox="0 0 56 56" fill="none">
          <path d="M28 6L6 16v12c0 14 9 22 22 28 13-6 22-14 22-28V16L28 6z"
            stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          <circle cx="28" cy="26" r="7" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M28 33v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </div>
      <h2 className={styles.heading}>CVE Intelligence Search</h2>
      <p className={styles.sub}>
        Search the live NIST NVD database<br className={styles.br}/>
        200,000+ vulnerabilities, updated in real time
      </p>

      <p className={styles.quickLabel}>Notable vulnerabilities</p>
      <div className={styles.grid}>
        {QUICK.map(({ label, q }) => (
          <button key={q} className={styles.quickBtn} onClick={() => onQuick(q)}>
            <span className={styles.qId}>{q}</span>
            <span className={styles.qName}>{label}</span>
          </button>
        ))}
      </div>

      <div className={styles.hint}>
        <span>Try</span>
        <code>CVE-2024-XXXXX</code>
        <span>or keyword like</span>
        <code>openssl</code>
      </div>
    </div>
  )
}
