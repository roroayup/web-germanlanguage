import { PRONOUNS, perfektForm } from '../../lib/german'

/** Präsens and Perfekt side by side; `highlight` marks one pronoun row. */
export function VerbTable({ verb, highlight }) {
  return (
    <table lang="de" className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs uppercase tracking-wider text-muted">
          <th className="py-2 pr-3 font-semibold" scope="col">
            <span className="sr-only">Pronomen</span>
          </th>
          <th className="py-2 pr-3 font-semibold" scope="col">
            Präsens
          </th>
          <th className="py-2 font-semibold" scope="col">
            Perfekt
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {PRONOUNS.map((pronoun) => (
          <tr key={pronoun.key} className={pronoun.key === highlight ? 'bg-accent-soft' : ''}>
            <th scope="row" className="py-2 pl-2 pr-3 text-left font-normal text-muted">
              {pronoun.label}
            </th>
            <td className="py-2 pr-3 font-semibold">{verb.present[pronoun.key]}</td>
            <td className="py-2 pr-2">{perfektForm(verb, pronoun.key) ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
