import { useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import type { Bug } from '../types'
import { BUG_TYPES } from '../types'
import Navbar from '../components/Navbar'
import PriorityBadge from '../components/PriorityBadge'
import StatusBadge from '../components/StatusBadge'

export default function SearchBugs() {
  const [keyword, setKeyword] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterType, setFilterType] = useState('')
  const [results, setResults] = useState<Bug[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    setLoading(true)
    setError('')
    setSearched(false)
    try {
      const q = query(collection(db, 'bugs'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Bug))

      const kw = keyword.trim().toLowerCase()
      const filtered = all.filter((b) => {
        if (kw && !b.title.toLowerCase().includes(kw) && !b.description.toLowerCase().includes(kw)) {
          return false
        }
        if (filterStatus && b.status !== filterStatus) return false
        if (filterPriority && b.priority !== filterPriority) return false
        if (filterType && b.bugType !== filterType) return false
        return true
      })
      setResults(filtered)
    } catch {
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Search Bugs</h1>
          <p className="text-sm text-gray-500 mt-0.5">Search by keyword, status, priority, or type.</p>
        </div>

        {/* Search bar + filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 space-y-4">
          {/* Keyword */}
          <div className="flex gap-3">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by title or description…"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap"
            >
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg text-sm px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All</option>
                <option>Open</option>
                <option>In Progress</option>
                <option>Fixed</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Priority:</label>
              <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
                className="border border-gray-300 rounded-lg text-sm px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Type:</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg text-sm px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All</option>
                {BUG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Results */}
        {!searched ? (
          <div className="text-center text-gray-400 text-sm py-12">
            Enter a keyword or select filters, then click Search.
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-500 font-medium">No results found</p>
            <p className="text-gray-400 text-sm mt-1">Try different keywords or adjust your filters.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-3">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
            <div className="space-y-3">
              {results.map((bug) => (
                <Link
                  key={bug.id}
                  to={`/bug/${bug.id}`}
                  className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm font-semibold text-gray-900">{bug.title}</p>
                    <div className="flex gap-2 shrink-0">
                      <PriorityBadge priority={bug.priority} />
                      <StatusBadge status={bug.status} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{bug.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    <span>{bug.bugType}</span>
                    <span>{bug.dateFound}</span>
                    <span>Reported by {bug.reportedBy?.name}</span>
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
