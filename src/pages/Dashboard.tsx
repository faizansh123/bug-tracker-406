import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import type { Bug } from '../types'
import Navbar from '../components/Navbar'
import PriorityBadge from '../components/PriorityBadge'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Dashboard() {
  const navigate = useNavigate()
  const [bugs, setBugs] = useState<Bug[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')

  useEffect(() => {
    const fetchBugs = async () => {
      try {
        const q = query(collection(db, 'bugs'), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Bug))
        setBugs(data)
      } catch {
        setError('Failed to load bugs. Please refresh.')
      } finally {
        setLoading(false)
      }
    }
    fetchBugs()
  }, [])

  const filtered = bugs.filter((b) => {
    if (filterStatus && b.status !== filterStatus) return false
    if (filterPriority && b.priority !== filterPriority) return false
    return true
  })

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bug Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">{filtered.length} bug{filtered.length !== 1 ? 's' : ''} found</p>
          </div>
          <button
            onClick={() => navigate('/report')}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Report Bug
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg text-sm px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Fixed</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Priority:</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-gray-300 rounded-lg text-sm px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
          {(filterStatus || filterPriority) && (
            <button
              onClick={() => { setFilterStatus(''); setFilterPriority('') }}
              className="text-sm text-indigo-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Bug table */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 font-medium">No bugs found</p>
            <p className="text-gray-400 text-sm mt-1">
              {filterStatus || filterPriority ? 'Try adjusting your filters.' : 'Report your first bug to get started.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Title', 'Type', 'Priority', 'Status', 'Date Found', 'Reported By'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((bug) => (
                    <tr
                      key={bug.id}
                      onClick={() => navigate(`/bug/${bug.id}`)}
                      className="hover:bg-indigo-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate">
                        {bug.title}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{bug.bugType}</td>
                      <td className="px-4 py-3"><PriorityBadge priority={bug.priority} /></td>
                      <td className="px-4 py-3"><StatusBadge status={bug.status} /></td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{bug.dateFound}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{bug.reportedBy?.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
              {filtered.map((bug) => (
                <Link
                  key={bug.id}
                  to={`/bug/${bug.id}`}
                  className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2">{bug.title}</p>
                    <PriorityBadge priority={bug.priority} />
                  </div>
                  <div className="flex flex-wrap gap-2 items-center text-xs text-gray-500">
                    <StatusBadge status={bug.status} />
                    <span>{bug.bugType}</span>
                    <span>{bug.dateFound}</span>
                    <span>by {bug.reportedBy?.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
