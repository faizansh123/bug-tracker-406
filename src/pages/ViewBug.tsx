import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { Bug } from '../types'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import PriorityBadge from '../components/PriorityBadge'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div>
      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</dt>
      <dd className="text-sm text-gray-900 whitespace-pre-wrap wrap-break-word">{value}</dd>
    </div>
  )
}

export default function ViewBug() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { userProfile } = useAuth()
  const isClient = userProfile?.role === 'Client'
  const [bug, setBug] = useState<Bug | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, 'bugs', id!))
        if (!snap.exists()) {
          setError('Bug not found.')
        } else {
          setBug({ id: snap.id, ...snap.data() } as Bug)
        }
      } catch {
        setError('Failed to load bug details.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  if (loading) return <LoadingSpinner />

  if (error || !bug) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-12 text-center">
          <p className="text-red-600 font-medium">{error || 'Bug not found.'}</p>
          <Link to="/dashboard" className="mt-4 inline-block text-indigo-600 hover:underline text-sm">
            ← Back to Dashboard
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mb-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 wrap-break-word">{bug.title}</h1>
          </div>
          {!isClient && (
            <Link
              to={`/bug/${bug.id}/edit`}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Bug
            </Link>
          )}
        </div>

        {/* Status / Priority row */}
        <div className="flex flex-wrap gap-3 mb-6">
          <StatusBadge status={bug.status} />
          <PriorityBadge priority={bug.priority} />
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {bug.bugType}
          </span>
        </div>

        {/* Main card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          {/* Overview section */}
          <section>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4">
              Overview
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <Field label="Date Found" value={bug.dateFound} />
              <Field label="Status" value={bug.status} />
              <Field label="Priority" value={bug.priority} />
              <Field label="Bug Type" value={bug.bugType} />
              {(bug.status === 'Open' || bug.status === 'In Progress') && (
                <Field label="Estimated Fix Date" value={bug.estimatedFixDate} />
              )}
              {bug.status === 'Fixed' && (
                <Field label="Date Fixed" value={bug.fixedDate} />
              )}
            </dl>
          </section>

          {/* Description section */}
          <section>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4">
              Details
            </h2>
            <dl className="space-y-4">
              <Field label="Description" value={bug.description} />
              <Field label="Affected Files" value={bug.affectedFiles} />
              <Field label="Impact" value={bug.impact} />
              <Field label="Steps to Reproduce" value={bug.stepsToReproduce} />
              <Field label="Additional Info" value={bug.additionalInfo} />
            </dl>
          </section>

          {/* Reporter section */}
          <section>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4">
              Reporter
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
              <Field label="Name" value={bug.reportedBy?.name} />
              <Field label="Role" value={bug.reportedBy?.role} />
              <Field label="Contact" value={bug.reportedBy?.contactInfo} />
            </dl>
          </section>
        </div>
      </main>
    </div>
  )
}
