import React from 'react'
import { sevColors } from '../utils/severity.js'
import styles from './CVECard.module.css'

export default function CVECard({ cve, selected, onSelect, isKev, compact }) {
  const c = sevColors(cve.severity)

  return (
    <div
      className={`${styles.card} ${selected ? styles.sel : ''} ${compact ? styles.compact : ''}`}
      onClick={onSelect}
      style={selected ? { borderLeftColor: c.text } : {}}
    >
      {/* ── Row 1: ID + badges + score ── */}
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

      {/* ── Description ── */}
      {!compact && (
        <p className={styles.desc}>{cve.desc}</p>
      )}

      {/* ── CVSS bar ── */}
      {!compact && cve.score != null && (
        <div className={styles.barWrap}>
          <div className={styles.barTrack}>
            <div className={styles.barFill} style={{ width: `${(cve.score/10)*100}%`, background: c.bar }} />
          </div>
          <span className={styles.barScore} style={{ color: c.text }}>{cve.score.toFixed(1)} / 10</span>
        </div>
      )}

      {/* ── Footer ── */}
      <div className={styles.footer}>
        <div className={styles.tags}>
          {cve.tags.slice(0, 3).map(t => (
            <span key={t} className={styles.tag}>{t}</span>
          ))}
          {cve.weaknesses[0] && (
            <span className={styles.cwe}>{cve.weaknesses[0]}</span>
          )}
        </div>
        <span className={styles.date}>{cve.published}</span>
      </div>

      {/* ── Click hint (only when not selected) ── */}
      {!compact && !selected && (
        <div className={styles.hint}>View details →</div>
      )}
    </div>
  )
}
