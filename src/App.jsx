import { useState, useEffect } from 'react'
import InputPanel from './components/InputPanel'
import ModeSelector from './components/ModeSelector'
import ScoreBadge from './components/ScoreBadge'
import OneLineSummary from './components/OneLineSummary'
import SummaryCard from './components/SummaryCard'
import ShareButton from './components/ShareButton'
import SkeletonLoader from './components/SkeletonLoader'
import ComplianceChecklist from './components/ComplianceChecklist'
import AskQuestion from './components/AskQuestion'
import { analyzeLegalText } from './utils/sarvamApi'
import { parseShareFromURL } from './utils/shareLink'

export default function App() {
  const [text, setText] = useState('')
  const [docName, setDocName] = useState('Document')
  const [mode, setMode] = useState('full')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [sharedView, setSharedView] = useState(false)

  useEffect(() => {
    const shared = parseShareFromURL()
    if (shared) {
      setResult(shared.result)
      setDocName(shared.docName || 'Shared document')
      setSharedView(true)
    }
  }, [])

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Please provide some legal text first — paste it, upload a file, or enter a URL.')
      return
    }
    if (text.trim().length < 100) {
      setError('That looks too short. Please paste more of the document.')
      return
    }
    setError('')
    setResult(null)
    setLoading(true)
    setSharedView(false)
    try {
      const data = await analyzeLegalText(text, mode)
      setResult(data)
      window.history.replaceState(null, '', window.location.pathname)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setSharedView(false)
    setText('')
    setError('')
    window.history.replaceState(null, '', window.location.pathname)
  }

  const isCompliance = result?.type === 'compliance'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-10">

        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl text-2xl mb-4">⚖️</div>
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">LegalLens</h1>
          <p className="text-slate-500 text-base">We read the boring stuff so you don't have to</p>
        </header>

        {sharedView && (
          <div className="mb-4 flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
            <p className="text-sm text-indigo-700">
              📤 Viewing shared summary for: <strong>{docName}</strong>
            </p>
            <button onClick={handleReset} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">
              Analyze my own →
            </button>
          </div>
        )}

        {!sharedView && (
          <div className="space-y-4">
            <InputPanel onTextReady={setText} onDocNameChange={setDocName} />
            <ModeSelector mode={mode} onChange={setMode} />

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
              className="btn-primary w-full py-4 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {mode === 'compliance' ? 'Checking compliance...' : 'Analyzing with Sarvam AI...'}
                </span>
              ) : (
                mode === 'compliance' ? '⚖️ Run compliance check' : '✦ Analyze this document'
              )}
            </button>
          </div>
        )}

        {loading && (
          <div className="mt-6">
            <p className="text-sm text-slate-400 text-center mb-4">
              {mode === 'compliance'
                ? 'Checking GDPR and DPDP compliance...'
                : 'Reading through the legalese so you don\'t have to...'}
            </p>
            <SkeletonLoader />
          </div>
        )}

        {result && !loading && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-sm font-medium text-slate-500">
                Results for: <span className="text-slate-700">{docName}</span>
              </h2>
              <div className="flex gap-2 flex-wrap">
                <ShareButton docName={docName} result={result} />
                {!sharedView && (
                  <button onClick={handleReset} className="btn-secondary text-sm">
                    ↺ New analysis
                  </button>
                )}
              </div>
            </div>

            {isCompliance ? (
              <ComplianceChecklist data={result} />
            ) : (
              <>
                {result.oneliner && <OneLineSummary text={result.oneliner} />}

                {result.score && (
                  <ScoreBadge
                    score={result.score}
                    verdict={result.verdict}
                    breakdown={result.breakdown || []}
                  />
                )}

                {result.sections?.length > 0 && (
                  <div className="space-y-3">
                    {result.sections.map((section, i) => (
                      <SummaryCard key={i} section={section} />
                    ))}
                  </div>
                )}

                {result.sections?.length === 0 && (
                  <div className="card text-center py-8">
                    <p className="text-2xl mb-2">✅</p>
                    <p className="text-sm font-medium text-slate-700">Nothing found for this mode</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try a different mode or paste more of the document
                    </p>
                  </div>
                )}

                {text && <AskQuestion documentText={text} />}
              </>
            )}

            <p className="text-xs text-slate-400 text-center pt-2">
              AI-generated summary — not legal advice. When in doubt, consult a lawyer.
            </p>
          </div>
        )}

        <footer className="mt-16 text-center text-xs text-slate-400 space-y-1">
          
          <p>Cloud Computing course · SaaS project</p>
        </footer>
      </div>
    </div>
  )
}
