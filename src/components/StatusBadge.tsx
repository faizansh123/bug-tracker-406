interface Props {
  status: string
}

const map: Record<string, string> = {
  Open: 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-orange-100 text-orange-800',
  Fixed: 'bg-gray-100 text-gray-600',
}

export default function StatusBadge({ status }: Props) {
  const cls = map[status] ?? 'bg-gray-100 text-gray-700'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}
