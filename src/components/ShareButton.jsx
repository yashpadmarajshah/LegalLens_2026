import { useState } from 'react'
import { buildShareURL } from '../utils/shareLink'

export default function ShareButton({ docName, result }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = buildShareURL(docName, result)
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      prompt('Copy this link:', url)
    }
  }

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
        copied
          ? 'bg-green-50 border-green-300 text-green-700'
          : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
      }`}
    >
      {copied ? '✅ Link copied!' : '🔗 Share summary'}
    </button>
  )
}
