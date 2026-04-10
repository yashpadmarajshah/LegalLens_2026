export default function OneLineSummary({ text }) {
  return (
    <div className="bg-indigo-600 text-white rounded-2xl p-5">
      <p className="text-xs font-medium uppercase tracking-wider opacity-75 mb-2">
        What you're actually agreeing to
      </p>
      <p className="text-base font-medium leading-relaxed">
        "{text}"
      </p>
    </div>
  )
}
