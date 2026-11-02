import topics from '../../data/topics.json'

/** A native select — 15 topics is too many for chips on a phone. */
export function TopicSelect({ value, onChange, label = 'Topik', allLabel = 'Semua topik', counts }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      <select
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || null)}
        className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm outline-none focus:border-accent-strong"
      >
        <option value="">{allLabel}</option>
        {topics.map((topic) => (
          <option key={topic.id} value={topic.id} disabled={counts && !counts[topic.id]}>
            {topic.icon} {topic.de} — {topic.meaning}
            {counts ? ` (${counts[topic.id] ?? 0})` : ''}
          </option>
        ))}
      </select>
    </label>
  )
}
