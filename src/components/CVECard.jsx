import React from 'react'
import { sevColors } from '../utils/severity.js'
import styles from './CVECard.module.css'

export default function CVECard({ cve, selected, onSelect, isKev, compact }) {
  const c = sevColors(cve.severity)

  const formatDate = (d) => {
    if (!d) return '—'
    try {
      const [year, month, day] = d.split('-')
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      return `${months[parseInt(month)-1]} ${parseInt(day)}, ${year}`
    } catch {
      return d
    }
  }

  const weaknesses = cve.weaknesses || []
  const tags = cve.tags || []

  return (
    <div
      className={`${styles.card} ${selected ? styles.sel : ''} ${compact ? styles.compact : ''}`}
      onClick={onSelect}
      style={selected ? { borderLeftColor: c.text } : {}}
    >
      {/* Row 1: ID + badges + score */}
      <div className={styles.row1}>
        <span className={styles.id}>{cve.id}</span>
        <span className={styles.sev} style={{ color: c.text, background: c.bg, border: `1px solid ${c.border}` }}>
          {cve.severity}
        </span>
        {isKev && <span className={styles.kev}>⚠ KEV</span>}
        {cve.score != null && (
          <span className={styles.score} style={{ color: c.text }}>{cve.score.toFixed(1)}</span>
        )}
      </div>

      {/* Publication date */}
      {!compact && cve.published && (
        <div className={styles.pubDate}>
          <svg viewBox="0 0 14 14" fill="none" width="12" style={{flexShrink:0}}>
            <rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M1 6h12" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M4 1v2M10 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Published <strong>{formatDate(cve.published)}</strong>
          {cve.modified && cve.modified !== cve.published && (
            <span className={styles.modDate}> · Updated {formatDate(cve.modified)}</span>
          )}
        </div>
      )}

      {/* Description */}
      {!compact && (
        <p className={styles.desc}>{cve.desc}</p>
      )}

      {/* CVSS bar */}
      {!compact && cve.score != null && (
        <div className={styles.barWrap}>
          <div className={styles.barTrack}>
            <div className={styles.barFill} style={{ width: `${(cve.score/10)*100}%`, background: c.bar }} />
          </div>
          <span className={styles.barScore} style={{ color: c.text }}>{cve.score.toFixed(1)} / 10</span>
        </div>
      )}

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.tags}>
          {tags.slice(0, 3).map(t => (
            <span key={t} className={styles.tag}>{t}</span>
          ))}
          {weaknesses[0] && (
            <span className={styles.cwe}>{weaknesses[0]}</span>
          )}
        </div>
        {compact && <span className={styles.date}>{formatDate(cve.published)}</span>}
      </div>

      {!compact && !selected && (
        <div className={styles.hint}>View details →</div>
      )}
    </div>
  )
}
