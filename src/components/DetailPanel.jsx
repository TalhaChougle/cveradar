import React, { useState } from 'react'
import { sevColors } from '../utils/severity.js'
import styles from './DetailPanel.module.css'

// ── Plain-English lookup tables ──────────────────────────────────────
const SEV_EXPLAIN = {
  CRITICAL: 'This is as dangerous as it gets. Attackers can completely take over affected systems remotely, with no login or user interaction required. Anyone running vulnerable software should patch immediately.',
  HIGH:     'Very dangerous. Attackers can cause serious damage — steal data, crash systems, or gain unauthorized access. Often exploitable over the internet. Patch as soon as possible.',
  MEDIUM:   'Moderate risk. Exploitation requires specific conditions, such as being on the same network or tricking a user into taking an action. Still worth patching promptly.',
  LOW:      'Limited risk. Usually requires local access or unusual conditions to exploit. Patch during your next routine update cycle.',
  UNKNOWN:  'Severity has not yet been assessed by NIST. Check back later for an updated score.',
}

const ATTACK_VECTOR_EXPLAIN = {
  NETWORK:          'Can be exploited remotely over the internet — no physical access needed.',
  ADJACENT_NETWORK: 'Attacker must be on the same local network (e.g. same WiFi).',
  ADJACENT:         'Attacker must be on the same local network (e.g. same WiFi).',
  LOCAL:            'Attacker needs local access to the machine.',
  PHYSICAL:         'Attacker needs physical access to the device.',
}

const COMPLEXITY_EXPLAIN = {
  LOW:  'Easy to exploit — no special conditions required.',
  HIGH: 'Hard to exploit — requires specific conditions or circumstances to pull off.',
}

const PRIV_EXPLAIN = {
  NONE:  'No login or account needed — anyone can attempt this attack.',
  LOW:   'Requires a basic/low-privilege account on the system.',
  HIGH:  'Requires an admin or high-privilege account.',
  SINGLE:'Requires authentication.',
  MULTIPLE:'Requires multiple authentications.',
}

const UI_EXPLAIN = {
  NONE:     'No user interaction needed — the attack happens automatically.',
  REQUIRED: 'A user must take an action (e.g. click a link, open a file) for the attack to work.',
}

const IMPACT_EXPLAIN = {
  NONE:     'No impact',
  LOW:      'Limited impact',
  PARTIAL:  'Partial impact',
  COMPLETE: 'Complete impact',
  HIGH:     'Severe impact',
}

const SCORE_LABEL = s => {
  if (s >= 9.0) return 'Critical — patch immediately'
  if (s >= 7.0) return 'High — patch as soon as possible'
  if (s >= 4.0) return 'Medium — patch in next update cycle'
  if (s >  0)   return 'Low — patch when convenient'
  return 'Score not available'
}

// ── Sub-components ───────────────────────────────────────────────────
function Section({ label, icon, children }) {
  return (
    <div className={styles.section}>
      <div className={styles.sLabel}>{icon && <span className={styles.sIcon}>{icon}</span>}{label}</div>
      <div className={styles.sBody}>{children}</div>
    </div>
  )
}

function MetricRow({ label, value, explain }) {
  if (!value) return null
  return (
    <div className={styles.metricRow}>
      <div className={styles.metricLeft}>
        <span className={styles.metricLabel}>{label}</span>
        <span className={styles.metricValue}>{value}</span>
      </div>
      {explain && <p className={styles.metricExplain}>{explain}</p>}
    </div>
  )
}

function ImpactBar({ label, value }) {
  if (!value) return null
  const levels = { NONE: 0, LOW: 33, PARTIAL: 50, COMPLETE: 100, HIGH: 100 }
  const colors  = { NONE: 'var(--text3)', LOW: '#22c97a', PARTIAL: '#f59e0b', COMPLETE: '#e8372a', HIGH: '#e8372a' }
  const pct     = levels[value] ?? 0
  const color   = colors[value] ?? 'var(--text3)'
  return (
    <div className={styles.impactBar}>
      <span className={styles.impactLabel}>{label}</span>
      <div className={styles.impactTrack}>
        <div className={styles.impactFill} style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className={styles.impactVal} style={{ color }}>{value}</span>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────
export default function DetailPanel({ cve, isKev, onBack, showBack }) {
  const [showRawVector, setShowRawVector] = useState(false)

  if (!cve) return (
    <div className={styles.empty}>
      <svg viewBox="0 0 56 56" fill="none" width="44">
        <path d="M28 6L6 16v12c0 14 9 22 22 28 13-6 22-14 22-28V16L28 6z"
          stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        <circle cx="28" cy="26" r="7" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M28 33v6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
      <p>Click any CVE to see details</p>
    </div>
  )

  const c   = sevColors(cve.severity)
  const pct = cve.score != null ? (cve.score / 10) * 100 : 0

  return (
    <div className={styles.panel} key={cve.id}>

      {/* ══ HEADER ══ */}
      <div className={styles.header}>
        {showBack && (
          <button className={styles.backBtn} onClick={onBack}>
            <svg viewBox="0 0 16 16" fill="none" width="13">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to list
          </button>
        )}

        <div className={styles.hTop}>
          <span className={styles.cveId}>{cve.id}</span>
          <div className={styles.hBadges}>
            {isKev && <span className={styles.kevBadge}>⚠ Actively Exploited</span>}
            {cve.status && <span className={styles.statusPill}>{cve.status}</span>}
          </div>
        </div>

        <div className={styles.scoreRow}>
          <span className={styles.bigScore} style={{ color: c.text }}>
            {cve.score != null ? cve.score.toFixed(1) : '—'}
          </span>
          <div className={styles.scoreRight}>
            <span className={styles.sevLabel} style={{ color: c.text }}>{cve.severity}</span>
            <div className={styles.barTrack}>
              <div className={styles.barFill} style={{ width: `${pct}%`, background: c.bar }}/>
            </div>
            <span className={styles.scoreHint}>{SCORE_LABEL(cve.score)}</span>
          </div>
        </div>
      </div>

      {/* ══ BODY ══ */}
      <div className={`${styles.body} scroll-safe-bottom`}>

        {/* Severity plain-English */}
        <div className={styles.sevExplain} style={{ borderLeftColor: c.text }}>
          <span className={styles.sevExplainTitle} style={{ color: c.text }}>
            What does {cve.severity} mean?
          </span>
          <p>{SEV_EXPLAIN[cve.severity] ?? SEV_EXPLAIN.UNKNOWN}</p>
        </div>

        {/* KEV warning */}
        {isKev && (
          <div className={styles.kevBlock}>
            <svg viewBox="0 0 16 16" fill="none" width="20" style={{flexShrink:0,marginTop:2}}>
              <path d="M8 2L2 5v4c0 3.5 2.5 5.5 6 7 3.5-1.5 6-3.5 6-7V5L8 2z" fill="#f59e0b" opacity=".25"/>
              <path d="M8 6v3M8 11v.5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div>
              <strong>Confirmed: Being Actively Exploited Right Now</strong>
              <p>The US Cybersecurity &amp; Infrastructure Security Agency (CISA) has confirmed real-world attackers are actively using this vulnerability. If any of your software is listed below as affected, treat this as an emergency and update immediately.</p>
            </div>
          </div>
        )}

        {/* Description */}
        <Section label="What is this vulnerability?" icon="🔍">
          <p className={styles.desc}>{cve.desc}</p>
        </Section>

        {/* How hard is it to exploit? */}
        <Section label="How easy is this to exploit?" icon="⚡">
          <div className={styles.metricGrid}>
            <MetricRow
              label="Attack method"
              value={cve.attackVector}
              explain={ATTACK_VECTOR_EXPLAIN[cve.attackVector]}
            />
            <MetricRow
              label="Complexity"
              value={cve.attackComplexity}
              explain={COMPLEXITY_EXPLAIN[cve.attackComplexity]}
            />
            <MetricRow
              label="Login required"
              value={cve.privRequired}
              explain={PRIV_EXPLAIN[cve.privRequired]}
            />
            <MetricRow
              label="User interaction"
              value={cve.userInteraction}
              explain={UI_EXPLAIN[cve.userInteraction]}
            />
          </div>
          {(cve.exploitability || cve.impactScore) && (
            <div className={styles.subScores}>
              {cve.exploitability && (
                <div className={styles.subScore}>
                  <span className={styles.subScoreLabel}>Exploitability score</span>
                  <span className={styles.subScoreVal}>{cve.exploitability.toFixed(1)}</span>
                </div>
              )}
              {cve.impactScore && (
                <div className={styles.subScore}>
                  <span className={styles.subScoreLabel}>Impact score</span>
                  <span className={styles.subScoreVal}>{cve.impactScore.toFixed(1)}</span>
                </div>
              )}
            </div>
          )}
        </Section>

        {/* What damage can it cause? */}
        {(cve.confImpact || cve.integImpact || cve.availImpact) && (
          <Section label="What damage can it cause?" icon="💥">
            <p className={styles.impactIntro}>
              These three areas show what an attacker could affect if they successfully exploit this vulnerability:
            </p>
            <div className={styles.impactBars}>
              <ImpactBar label="Confidentiality (can they read your data?)"  value={cve.confImpact} />
              <ImpactBar label="Integrity (can they modify your data?)"      value={cve.integImpact} />
              <ImpactBar label="Availability (can they crash your system?)"  value={cve.availImpact} />
            </div>
          </Section>
        )}

        {/* Affected software */}
        {cve.affected.length > 0 && (
          <Section label="Affected Software" icon="📦">
            <p className={styles.affectedNote}>
              The following software versions are known to be vulnerable. If you use any of these, update them immediately.
            </p>
            <div className={styles.chips}>
              {cve.affected.map((a, i) => (
                <span key={i} className={styles.affChip}>{a}</span>
              ))}
            </div>
          </Section>
        )}

        {/* Vulnerability type */}
        {cve.weaknesses.length > 0 && (
          <Section label="Vulnerability Type (CWE)" icon="🏷️">
            <p className={styles.affectedNote}>The category of security flaw this belongs to:</p>
            <div className={styles.chips}>
              {cve.weaknesses.map(w => (
                <a key={w} className={styles.cweChip}
                  href={`https://cwe.mitre.org/data/definitions/${w.replace('CWE-','')}.html`}
                  target="_blank" rel="noopener noreferrer">
                  {w} — learn more ↗
                </a>
              ))}
            </div>
          </Section>
        )}

        {/* Patches & fixes */}
        {cve.patchRefs.length > 0 && (
          <Section label="Patches & Official Fixes" icon="🩹">
            <p className={styles.affectedNote}>Official patches and mitigations from vendors:</p>
            <div className={styles.refList}>
              {cve.patchRefs.map((r, i) => (
                <a key={i} className={`${styles.ref} ${styles.refPatch}`}
                  href={r.url} target="_blank" rel="noopener noreferrer">
                  <span className={styles.refUrl}>{r.url.replace(/^https?:\/\//,'')}</span>
                  <span className={styles.refTagGreen}>{r.tags[0]}</span>
                </a>
              ))}
            </div>
          </Section>
        )}

        {/* Known exploits */}
        {cve.exploitRefs.length > 0 && (
          <Section label="Known Exploits & Reports" icon="🔴">
            <p className={styles.affectedNote}>Public exploit code or reports exist for this vulnerability:</p>
            <div className={styles.refList}>
              {cve.exploitRefs.map((r, i) => (
                <a key={i} className={`${styles.ref} ${styles.refExploit}`}
                  href={r.url} target="_blank" rel="noopener noreferrer">
                  <span className={styles.refUrl}>{r.url.replace(/^https?:\/\//,'')}</span>
                  <span className={styles.refTagRed}>{r.tags[0]}</span>
                </a>
              ))}
            </div>
          </Section>
        )}

        {/* All references */}
        {cve.refs.filter(r => !cve.patchRefs.includes(r) && !cve.exploitRefs.includes(r)).length > 0 && (
          <Section label="Further Reading" icon="🔗">
            <div className={styles.refList}>
              {cve.refs
                .filter(r => !cve.patchRefs.includes(r) && !cve.exploitRefs.includes(r))
                .map((r, i) => (
                  <a key={i} className={styles.ref} href={r.url} target="_blank" rel="noopener noreferrer">
                    <span className={styles.refUrl}>{r.url.replace(/^https?:\/\//,'')}</span>
                    {r.tags[0] && <span className={styles.refTag}>{r.tags[0]}</span>}
                  </a>
                ))}
            </div>
          </Section>
        )}

        {/* Timeline */}
        <Section label="Timeline" icon="📅">
          <div className={styles.timeline}>
            {[
              { label: 'Discovered',   val: cve.published || '—' },
              { label: 'Last Updated', val: cve.modified  || '—' },
              { label: 'Status',       val: cve.status    || '—' },
            ].map(({ label, val }) => (
              <div key={label} className={styles.tlItem}>
                <span className={styles.tlLabel}>{label}</span>
                <span className={styles.tlVal}>{val}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Technical vector (collapsed by default) */}
        {cve.vector && (
          <div className={styles.vectorToggle}>
            <button className={styles.toggleBtn} onClick={() => setShowRawVector(v => !v)}>
              {showRawVector ? '▾' : '▸'} Technical CVSS Vector String
            </button>
            {showRawVector && (
              <code className={styles.vectorRaw}>{cve.vector}</code>
            )}
          </div>
        )}

        <a className={styles.nvdLink}
          href={`https://nvd.nist.gov/vuln/detail/${cve.id}`}
          target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 16 16" fill="none" width="13">
            <path d="M7 3H3v10h10V9M9 3h4v4M13 3L7 9"
              stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          View full official record on NIST NVD ↗
        </a>

      </div>
    </div>
  )
}
