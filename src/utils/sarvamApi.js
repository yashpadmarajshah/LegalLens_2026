const SARVAM_API_URL = 'https://api.sarvam.ai/v1/chat/completions'
const MODEL = 'sarvam-30b'

const MODE_PROMPTS = {
  full: `You are LegalLens. Analyze the ENTIRE legal document comprehensively.
Generate one card per distinct topic or issue found. Cover everything: data collection, data sharing, user rights, billing, cancellation, content ownership, liability, dispute resolution, account termination, and any red flags.
If the document has 3 topics, return 3 cards. If it has 12, return 12. Let the document decide — do not cap or pad.`,

  privacy: `You are LegalLens. Analyze ONLY the privacy-related parts of this document.
ONLY generate cards about: what personal data is collected, how data is used, who data is shared with, tracking and cookies, data retention periods, location data, device data, and user control over their data.
Do NOT generate cards about billing, user rights, dispute resolution, or anything unrelated to privacy.
If the document says nothing about privacy, return an empty sections array.`,

  rights: `You are LegalLens. Analyze ONLY the user rights sections of this document.
ONLY generate cards about: account deletion, data deletion, opting out of marketing, opting out of tracking, cancellation policy, data export/portability, contacting support, appealing decisions, and what the user is allowed or not allowed to do.
Do NOT generate cards about data collection, billing details, company rights, or anything unrelated to user rights.`,

  risks: `You are LegalLens. Analyze ONLY genuine legal risks and dark patterns and data misuse/breach and vague statements in this document.

ONLY flag these specific things:
- Binding arbitration clause or waiving right to sue in court
- Selling or monetizing user data to third parties for profit
- Unilateral right to change terms without meaningful notice
- Auto-renewing subscriptions that are difficult to cancel
- Claiming ownership of user-generated content
- Sharing data with vague "affiliates" or "partners" without naming them
- No data deletion right offered
- Broad indemnification placing legal liability on the user
- Class action lawsuit waiver
- Jurisdiction clauses that are unreasonable for the user

DO NOT flag these — they are normal and expected:
- "Do not hack or abuse our service" — this is standard security language
- Copyright protection of the company's own content/IP
- Age requirements (must be 13+, 18+)
- Account termination for violating terms — normal
- Disclaimer of warranties — standard legal boilerplate
- Requiring users to follow applicable laws
- Basic data collection for service functionality

When in doubt, do NOT flag it. Only flag clear, specific, harmful clauses.`,

  compliance: `You are LegalLens. Check this document for GDPR and DPDP compliance.
Return ONLY the compliance JSON format — no sections array needed.
For each right, determine: "found" (clearly stated), "vague" (mentioned but unclear), or "missing" (not mentioned at all).
Also provide a one-line note explaining your finding for each right.`
}

const SCORE_WEIGHTS = {
  binding_arbitration:    -2.0,
  sells_data_to_partners: -1.5,
  changes_terms_anytime:  -1.5,
  no_refund_policy:       -1.0,
  auto_renewal_trap:      -1.0,
  owns_user_content:      -1.0,
  cross_site_tracking:    -0.8,
  vague_third_party:      -0.8,
  indemnification:        -0.7,
  no_data_deletion:       -0.7,
  class_action_waiver:    -1.2,
  has_data_deletion:      +0.5,
  no_ads_no_selling:      +0.5,
  clear_opt_out:          +0.3,
  transparent_sharing:    +0.3,
}

export function calculateScore(flags) {
  let score = 10
  const breakdown = []

  for (const [key, weight] of Object.entries(SCORE_WEIGHTS)) {
    if (flags[key]) {
      score += weight
      breakdown.push({ key, weight, label: flagLabel(key) })
    }
  }

  return {
    score: Math.max(1, Math.min(10, Math.round(score * 10) / 10)),
    breakdown
  }
}

function flagLabel(key) {
  const labels = {
    binding_arbitration:    'Binding arbitration clause',
    sells_data_to_partners: 'Sells data to partners',
    changes_terms_anytime:  'Can change terms anytime',
    no_refund_policy:       'No refund policy',
    auto_renewal_trap:      'Auto-renewal trap',
    owns_user_content:      'Claims ownership of your content',
    cross_site_tracking:    'Tracks you across other sites',
    vague_third_party:      'Vague third-party data sharing',
    indemnification:        'Indemnification clause',
    no_data_deletion:       'No data deletion right',
    class_action_waiver:    'Class action lawsuit waiver',
    has_data_deletion:      'Offers data deletion',
    no_ads_no_selling:      'No ads / no data selling',
    clear_opt_out:          'Clear opt-out options',
    transparent_sharing:    'Transparent about data sharing',
  }
  return labels[key] || key
}

function buildSystemPrompt(mode) {
  const modeInstruction = MODE_PROMPTS[mode]

  if (mode === 'compliance') {
    return `${modeInstruction}

Respond ONLY with this exact JSON structure — no markdown, no backticks, no preamble:
{
  "gdpr": {
    "right_to_be_informed":       { "status": "found|vague|missing", "note": "one line explanation" },
    "right_of_access":            { "status": "found|vague|missing", "note": "one line explanation" },
    "right_to_rectification":     { "status": "found|vague|missing", "note": "one line explanation" },
    "right_to_erasure":           { "status": "found|vague|missing", "note": "one line explanation" },
    "right_to_restrict":          { "status": "found|vague|missing", "note": "one line explanation" },
    "right_to_portability":       { "status": "found|vague|missing", "note": "one line explanation" },
    "right_to_object":            { "status": "found|vague|missing", "note": "one line explanation" },
    "automated_decision_rights":  { "status": "found|vague|missing", "note": "one line explanation" }
  },
  "dpdp": {
    "right_to_access":            { "status": "found|vague|missing", "note": "one line explanation" },
    "right_to_correction":        { "status": "found|vague|missing", "note": "one line explanation" },
    "right_to_erasure":           { "status": "found|vague|missing", "note": "one line explanation" },
    "right_to_grievance":         { "status": "found|vague|missing", "note": "one line explanation" },
    "right_to_nominate":          { "status": "found|vague|missing", "note": "one line explanation" },
    "right_to_withdraw_consent":  { "status": "found|vague|missing", "note": "one line explanation" },
    "childrens_data_protection":  { "status": "found|vague|missing", "note": "one line explanation" }
  }
}`
  }

  return `${modeInstruction}

Tone: friendly and direct, like a smart friend warning you. Slightly alarming when warranted. Never use legal jargon in the plain English explanations.

Respond ONLY with this exact JSON — no markdown, no backticks, no preamble:
{
  "oneliner": "One casual sentence (max 20 words) summarizing what the user is really agreeing to.",
  "flags": {
    "binding_arbitration": true/false,
    "sells_data_to_partners": true/false,
    "changes_terms_anytime": true/false,
    "no_refund_policy": true/false,
    "auto_renewal_trap": true/false,
    "owns_user_content": true/false,
    "cross_site_tracking": true/false,
    "vague_third_party": true/false,
    "indemnification": true/false,
    "no_data_deletion": true/false,
    "class_action_waiver": true/false,
    "has_data_deletion": true/false,
    "no_ads_no_selling": true/false,
    "clear_opt_out": true/false,
    "transparent_sharing": true/false
  },
  "sections": [
    {
      "title": "Short title (max 5 words)",
      "type": "privacy|warning|rights|billing|risk",
      "items": ["plain English point", "another point"],
      "original_clause": "The actual excerpt from the document that this card is based on. Max 60 words."
    }
  ]
}

Rules:
- sections array: create one card per real distinct topic found. No minimum, no maximum — let the document decide.
- Every card must be based on something actually present in the document.
- Do not invent cards for topics not covered in the document.
- items: plain English only, no legal jargon, 1-4 points per card based on complexity.
- original_clause: quote or closely paraphrase the actual text that triggered this card.`
}

export async function analyzeLegalText(text, mode = 'full') {
  const apiKey = import.meta.env.VITE_SARVAM_KEY
  if (!apiKey) throw new Error('VITE_SARVAM_KEY is not set in your .env file.')

  const truncatedText = text.slice(0, 14000)

  const response = await fetch(SARVAM_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': apiKey,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 5000,
      messages: [
        { role: 'system', content: buildSystemPrompt(mode) },
        { role: 'user', content: `Analyze this legal document:\n\n${truncatedText}` },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Sarvam API error: ${response.status}`)
  }

  const data = await response.json()
  const raw = data.choices?.[0]?.message?.content || ''
  const clean = raw.replace(/```json/gi, '').replace(/```/g, '').trim()

  try {
    const parsed = JSON.parse(clean)

    if (mode === 'compliance') {
      return { type: 'compliance', ...parsed }
    }

    const { score, breakdown } = calculateScore(parsed.flags || {})
    const verdict = score <= 3 ? 'danger' : score <= 6 ? 'warn' : 'safe'

    return {
      type: 'analysis',
      oneliner: parsed.oneliner,
      score,
      verdict,
      breakdown,
      flags: parsed.flags,
      sections: parsed.sections || [],
    }
  } catch {
    throw new Error('Could not parse Sarvam response. Please try again.')
  }
}

export async function askQuestion(documentText, question, apiKey) {
  const key = apiKey || import.meta.env.VITE_SARVAM_KEY
  if (!key) throw new Error('VITE_SARVAM_KEY is not set.')

  const truncatedText = documentText.slice(0, 12000)

  const response = await fetch(SARVAM_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': key,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 600,
      messages: [
        {
          role: 'system',
          content: `You are LegalLens. The user has a specific question about a legal document.
Answer ONLY based on what the document actually says. Be direct and friendly — like a smart friend answering a question.
If the document doesn't mention the topic, say so clearly.
Keep your answer under 100 words. No jargon.`
        },
        {
          role: 'user',
          content: `Document:\n${truncatedText}\n\nQuestion: ${question}`
        }
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || 'No answer returned.'
}
