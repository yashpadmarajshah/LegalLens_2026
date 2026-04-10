import { useState, useRef } from 'react'
import { extractFromFile, extractFromURL } from '../utils/extractText'

const TABS = [
  { id: 'paste', label: '📋 Paste text' },
  { id: 'upload', label: '📄 Upload file' },
  { id: 'url', label: '🔗 From URL' },
]

const TRICKY_DOMAINS = ['google.com', 'apple.com', 'facebook.com', 'meta.com', 'twitter.com', 'x.com', 'linkedin.com', 'microsoft.com']
const isTrickyDomain = (u) => TRICKY_DOMAINS.some(d => u.includes(d))

export default function InputPanel({ onTextReady, onDocNameChange }) {
  const [activeTab, setActiveTab] = useState('paste')
  const [pasteText, setPasteText] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const fileRef = useRef()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setLoading(true)
    setFileName(file.name)
    onDocNameChange(file.name)
    try {
      const text = await extractFromFile(file)
      onTextReady(text)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleURL = async () => {
    if (!url.trim()) return
    setError('')
    setLoading(true)
    onDocNameChange(url)
    try {
      const text = await extractFromURL(url.trim())
      onTextReady(text)
    } catch (err) {
      if (isTrickyDomain(url)) {
        setError('💡 This site blocks automated fetching (Google, Apple, Meta etc. all do this). Easy fix: open the page in your browser → press Ctrl+A then Ctrl+C → switch to the Paste tab and paste it there.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePasteChange = (e) => {
    setPasteText(e.target.value)
    onTextReady(e.target.value)
    onDocNameChange('Pasted document')
  }

  return (
    <div className="card">
      <div className="flex gap-2 mb-4 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setError('') }}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              activeTab === tab.id ? 'tab-active' : 'tab-inactive'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'paste' && (
        <div>
          <textarea
            value={pasteText}
            onChange={handlePasteChange}
            placeholder="Paste your Terms of Service, Privacy Policy, EULA, or any legal text here..."
            className="w-full min-h-44 p-4 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition placeholder:text-slate-400"
          />
          <div className="text-right text-xs text-slate-400 mt-1">
            {pasteText.length.toLocaleString()} characters
          </div>
        </div>
      )}

      {activeTab === 'upload' && (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-10 text-center cursor-pointer transition-colors group"
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={handleFile}
          />
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Extracting text...</p>
            </div>
          ) : fileName ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl">✅</span>
              <p className="text-sm font-medium text-slate-700">{fileName}</p>
              <p className="text-xs text-slate-400">Click to change file</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl group-hover:scale-110 transition-transform">📄</span>
              <p className="text-sm font-medium text-slate-700">Click to upload a file</p>
              <p className="text-xs text-slate-400">Supports PDF, DOCX, TXT</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'url' && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleURL()}
              placeholder="https://example.com/privacy-policy"
              className="flex-1 px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
            />
            <button
              onClick={handleURL}
              disabled={loading || !url.trim()}
              className="btn-primary px-5 py-3 text-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Fetch'}
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Tip: Works best with smaller sites. For Google, Apple etc. — paste the text directly instead.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          {error}
        </div>
      )}
    </div>
  )
}
