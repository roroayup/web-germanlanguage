export function Card({ as: Tag = 'div', className = '', children, ...props }) {
  return (
    <Tag className={`rounded-card border border-line bg-surface shadow-soft ${className}`} {...props}>
      {children}
    </Tag>
  )
}
