const NVD_BASE = 'https://services.nvd.nist.gov/rest/json/cves/2.0'
const CISA_KEV = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json'

let kevSet = null

export async function fetchKEV() {
  if (kevSet) return kevSet
  try {
    const r = await fetch(CISA_KEV)
    if (!r.ok) throw new Error('KEV fetch failed')
    const data = await r.json()
    kevSet = new Set(data.vulnerabilities.map(v => v.cveID))
    return kevSet
  } catch {
    kevSet = new Set()
    return kevSet
  }
}

export async function searchCVEs({ query = '', resultsPerPage = 20, startIndex = 0, severityFilter = null, yearFilter = null }) {
  const params = new URLSearchParams()
  params.set('resultsPerPage', resultsPerPage)
  params.set('startIndex', startIndex)

  const isCveId = /^CVE-\d{4}-\d+$/i.test(query.trim())
  if (query.trim()) {
    if (isCveId) params.set('cveId', query.trim().toUpperCase())
    else { params.set('keywordSearch', query.trim()); params.set('keywordExactMatch', 'false') }
  }
  if (severityFilter && severityFilter !== 'all') params.set('cvssV3Severity', severityFilter.toUpperCase())
  if (yearFilter) {
    params.set('pubStartDate', `${yearFilter}-01-01T00:00:00.000`)
    params.set('pubEndDate',   `${yearFilter}-12-31T23:59:59.999`)
  }

  // Always fetch newest CVEs first by publication date.
  params.set('sortBy', 'publishedDate')
  params.set('orderBy', 'desc')

  const res = await fetch(`${NVD_BASE}?${params.toString()}`, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(res.status === 404 ? 'No CVEs found.' : `NVD API error: ${res.status}`)
  const data = await res.json()
  const items = (data.vulnerabilities ?? []).map(parseCVE)
  return {
    total: data.totalResults ?? 0,
    items: items.sort((a, b) => {
      if (a.published === b.published) return 0
      if (!a.published) return 1
      if (!b.published) return -1
      return b.published.localeCompare(a.published)
    }),
  }
}

function parseCVE(v) {
  const cve  = v.cve
  const id   = cve.id
  const desc = cve.descriptions?.find(d => d.lang === 'en')?.value ?? 'No description available.'

  const metrics = cve.metrics ?? {}
  let score = null, vector = null, severity = null
  let attackVector = null, attackComplexity = null, privRequired = null
  let userInteraction = null, scope = null, confImpact = null
  let integImpact = null, availImpact = null, exploitability = null, impactScore = null

  const v31 = metrics.cvssMetricV31?.[0]
  const v30 = metrics.cvssMetricV30?.[0]
  const v2  = metrics.cvssMetricV2?.[0]

  if (v31) {
    score = v31.cvssData.baseScore; vector = v31.cvssData.vectorString; severity = v31.cvssData.baseSeverity
    attackVector = v31.cvssData.attackVector; attackComplexity = v31.cvssData.attackComplexity
    privRequired = v31.cvssData.privilegesRequired; userInteraction = v31.cvssData.userInteraction
    scope = v31.cvssData.scope; confImpact = v31.cvssData.confidentialityImpact
    integImpact = v31.cvssData.integrityImpact; availImpact = v31.cvssData.availabilityImpact
    exploitability = v31.exploitabilityScore; impactScore = v31.impactScore
  } else if (v30) {
    score = v30.cvssData.baseScore; vector = v30.cvssData.vectorString; severity = v30.cvssData.baseSeverity
    attackVector = v30.cvssData.attackVector; attackComplexity = v30.cvssData.attackComplexity
    privRequired = v30.cvssData.privilegesRequired; userInteraction = v30.cvssData.userInteraction
    scope = v30.cvssData.scope; confImpact = v30.cvssData.confidentialityImpact
    integImpact = v30.cvssData.integrityImpact; availImpact = v30.cvssData.availabilityImpact
    exploitability = v30.exploitabilityScore; impactScore = v30.impactScore
  } else if (v2) {
    score = v2.cvssData.baseScore; vector = v2.cvssData.vectorString; severity = v2.baseSeverity
    attackVector = v2.cvssData.accessVector; attackComplexity = v2.cvssData.accessComplexity
    privRequired = v2.cvssData.authentication; confImpact = v2.cvssData.confidentialityImpact
    integImpact = v2.cvssData.integrityImpact; availImpact = v2.cvssData.availabilityImpact
    exploitability = v2.exploitabilityScore; impactScore = v2.impactScore
  }

  // CPE affected products
  const affected = []
  for (const cfg of cve.configurations ?? []) {
    for (const node of cfg.nodes ?? []) {
      for (const m of node.cpeMatch ?? []) {
        const parts = (m.criteria ?? '').split(':')
        if (parts.length >= 5) {
          const label = [parts[3], parts[4], parts[5]].filter(p => p && p !== '*').join(' ')
          if (label && !affected.includes(label)) affected.push(label)
        }
      }
    }
  }

  const refs = (cve.references ?? []).slice(0, 8).map(r => ({ url: r.url, tags: r.tags ?? [] }))
  const weaknesses = (cve.weaknesses ?? []).flatMap(w => w.description ?? []).filter(d => d.lang === 'en').map(d => d.value).slice(0, 5)
  const tags = [...new Set(affected.slice(0, 4).map(a => a.split(' ')[0]))]

  // Separate refs by type
  const patchRefs  = refs.filter(r => r.tags.some(t => ['Patch','Vendor Advisory','Mitigation'].includes(t)))
  const exploitRefs = refs.filter(r => r.tags.some(t => ['Exploit','Third Party Advisory'].includes(t)))

  return {
    id, desc, score, vector, severity: severity ?? 'UNKNOWN',
    published: cve.published?.slice(0, 10) ?? '',
    modified:  cve.lastModified?.slice(0, 10) ?? '',
    affected: affected.slice(0, 12), refs, patchRefs, exploitRefs,
    weaknesses, tags, status: cve.vulnStatus ?? '',
    attackVector, attackComplexity, privRequired, userInteraction,
    scope, confImpact, integImpact, availImpact,
    exploitability, impactScore,
  }
}
