import { useState, useEffect, useRef } from 'react'
import { askQuestion } from '../utils/sarvamApi'

export default function AskQuestion({ documentText }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [listening, setListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setSpeechSupported(true)
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-IN'

      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript
        setQuestion(transcript)
        setListening(false)
      }
      recognition.onerror = () => setListening(false)
      recognition.onend = () => setListening(false)
      recognitionRef.current = recognition
    }
  }, [])

  const toggleMic = () => {
    if (!recognitionRef.current) return
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
    } else {
      setQuestion('')
      setAnswer('')
      recognitionRef.current.start()
      setListening(true)
    }
  }

  const handleAsk = async () => {
    if (!question.trim()) return
    setError('')
    setAnswer('')
    setLoading(true)
    try {
      const result = await askQuestion(documentText, question.trim())
      setAnswer(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card border-indigo-100 bg-indigo-50">
      <p className="text-sm font-medium text-indigo-800 mb-3">
        💬 Ask anything about this document
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && handleAsk()}
          placeholder={listening ? '🎙 Listening...' : 'e.g. Do they sell my location data?'}
          className={`flex-1 px-4 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition ${
            listening ? 'border-red-300 bg-red-50' : 'border-slate-200'
          }`}
        />

        {speechSupported && (
          <button
            onClick={toggleMic}
            title={listening ? 'Stop listening' : 'Ask with microphone'}
            className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              listening
                ? 'bg-red-500 border-red-500 text-white animate-pulse'
                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            🎙
          </button>
        )}

        <button
          onClick={handleAsk}
          disabled={loading || !question.trim()}
          className="btn-primary px-4 py-2.5 text-sm"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : 'Ask'}
        </button>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {loading && (
        <div className="mt-3 flex items-center gap-2 text-sm text-indigo-600">
          <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          Reading the document for you...
        </div>
      )}

      {answer && !loading && (
        <div className="mt-3 p-4 bg-white border border-indigo-200 rounded-xl">
          <p className="text-xs font-medium text-indigo-500 mb-1.5">Answer</p>
          <p className="text-sm text-slate-700 leading-relaxed">{answer}</p>
        </div>
      )}

      <p className="text-xs text-slate-400 mt-3">
        Answers are based only on the document content — not general knowledge.
      </p>
    </div>
  )
}
