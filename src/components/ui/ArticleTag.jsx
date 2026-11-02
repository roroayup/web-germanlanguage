import { GENDERS } from '../../lib/german'

/** The der/die/das pill, always in its gender colour. */
export function ArticleTag({ article, className = '' }) {
  const gender = GENDERS[article]
  if (!gender) return null

  return (
    <span
      lang="de"
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-sm font-bold ${gender.soft} ${gender.text} ${className}`}
    >
      {article}
    </span>
  )
}
