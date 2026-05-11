export const SEV_COLOR = {
  CRITICAL: { text: '#ff4d4d', bg: '#2a0a0a', border: '#5c1414', bar: '#e8372a' },
  HIGH:     { text: '#f59e0b', bg: '#2d1e05', border: '#5a3800', bar: '#f59e0b' },
  MEDIUM:   { text: '#22c97a', bg: '#0a2918', border: '#0e4a30', bar: '#22c97a' },
  LOW:      { text: '#4a9eff', bg: '#0c1f3a', border: '#12305c', bar: '#4a9eff' },
  UNKNOWN:  { text: '#7a8aa8', bg: '#161c2a', border: '#1c2335', bar: '#7a8aa8' },
}

export function sevColors(sev = 'UNKNOWN') {
  return SEV_COLOR[sev.toUpperCase()] ?? SEV_COLOR.UNKNOWN
}

export function scoreColor(score) {
  if (score >= 9.0) return SEV_COLOR.CRITICAL.text
  if (score >= 7.0) return SEV_COLOR.HIGH.text
  if (score >= 4.0) return SEV_COLOR.MEDIUM.text
  return SEV_COLOR.LOW.text
}
