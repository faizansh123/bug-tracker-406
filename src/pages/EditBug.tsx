import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import type { Bug } from '../types'
import { BUG_TYPES, PRIORITIES, STATUSES, validateStatusTransition } from '../types'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../components/LoadingSpinner'

interface FormState {
  title: string
  dateFound: string
  bugType: string
  description: string
  priority: string
  affectedFiles: string
  impact: string
  stepsToReproduce: string
  additionalInfo: string
  status: string
  estimatedFixDate: string
  fixedDate: string
}

export default function EditBug() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { userProfile } = useAuth()
  const [originalStatus, setOriginalStatus] = useState('')
  const [form, setForm] = useState<FormState>({
    title: '', dateFound: '', bugType: '', description: '',
    priority: '', affectedFiles: '', impact: '', stepsToReproduce: '',
    additionalInfo: '', status: '', estimatedFixDate: '', fixedDate: '',
  })
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [statusError, setStatusError] = useState('')
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, 'bugs', id!))
        if (!snap.exists()) {
          setServerError('Bug not found.')
          return
        }
        const data = snap.data() as Bug
        setOriginalStatus(data.status)
        setForm({
          title: data.title ?? '',
          dateFound: data.dateFound ?? '',
          bugType: data.bugType ?? '',
          description: data.description ?? '',
          priority: data.priority ?? '',
          affectedFiles: data.affectedFiles ?? '',
          impact: data.impact ?? '',
          stepsToReproduce: data.stepsToReproduce ?? '',
          additionalInfo: data.additionalInfo ?? '',
          status: data.status ?? '',
          estimatedFixDate: data.estimatedFixDate ?? '',
          fixedDate: data.fixedDate ?? '',
        })
      } catch {
        setServerError('Failed to load bug.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (field === 'status') setStatusError('')
  }

  const validate = (): boolean => {
    const e: Partial<FormState> = {}
    if (!form.title.trim()) e.title = 'Title is required.'
    if (!form.dateFound.trim()) e.dateFound = 'Date found is required.'
    if (!form.bugType) e.bugType = 'Bug type is required.'
    if (!form.description.trim()) e.description = 'Description is required.'
    if (!form.priority) e.priority = 'Priority is required.'
    if (!form.status) e.status = 'Status is required.'
    if ((form.status === 'Open' || form.status === 'In Progress') && !form.estimatedFixDate.trim()) {
      e.estimatedFixDate = 'Estimated fix date is required.'
    }
    if (form.status === 'Fixed' && !form.fixedDate.trim()) {
      e.fixedDate = 'Date fixed is required.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatusError('')
    setServerError('')
    if (!validate()) return

    // Check status transition
    const transitionErr = validateStatusTransition(originalStatus, form.status)
    if (transitionErr) {
      setStatusError(transitionErr)
      return
    }

    setSaving(true)
    try {
      await updateDoc(doc(db, 'bugs', id!), {
        title: form.title.trim(),
        dateFound: form.dateFound.trim(),
        bugType: form.bugType,
        description: form.description.trim(),
        priority: form.priority,
        affectedFiles: form.affectedFiles.trim(),
        impact: form.impact.trim(),
        stepsToReproduce: form.stepsToReproduce.trim(),
        additionalInfo: form.additionalInfo.trim(),
        status: form.status,
        estimatedFixDate:
          form.status === 'Open' || form.status === 'In Progress'
            ? form.estimatedFixDate.trim()
            : '',
        fixedDate: form.status === 'Fixed' ? form.fixedDate.trim() : '',
        updatedAt: serverTimestamp(),
      })
      navigate(`/bug/${id}`)
    } catch {
      setServerError('Failed to update bug. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = (field: keyof FormState) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
      errors[field] ? 'border-red-400' : 'border-gray-300'
    }`

  if (loading) return <LoadingSpinner />
  if (userProfile?.role === 'Client') return <Navigate to={`/bug/${id}`} replace />

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(`/bug/${id}`)}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Bug Details
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Bug Report</h1>
        </div>

        {serverError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {serverError}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input type="text" value={form.title} onChange={set('title')}
                className={inputCls('title')} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Date Found */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Found <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-1">(MM/DD HH:mm)</span>
              </label>
              <input type="text" value={form.dateFound} onChange={set('dateFound')}
                className={inputCls('dateFound')} />
              {errors.dateFound && <p className="text-red-500 text-xs mt-1">{errors.dateFound}</p>}
            </div>

            {/* Bug Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bug Type <span className="text-red-500">*</span>
              </label>
              <select value={form.bugType} onChange={set('bugType')} className={inputCls('bugType')}>
                <option value="">Select bug type…</option>
                {BUG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.bugType && <p className="text-red-500 text-xs mt-1">{errors.bugType}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea value={form.description} onChange={set('description')} rows={4}
                className={inputCls('description')} />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority <span className="text-red-500">*</span>
              </label>
              <select value={form.priority} onChange={set('priority')} className={inputCls('priority')}>
                <option value="">Select priority…</option>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority}</p>}
            </div>

            {/* Affected Files */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Affected Files</label>
              <input type="text" value={form.affectedFiles} onChange={set('affectedFiles')}
                className={inputCls('affectedFiles')} />
            </div>

            {/* Impact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Impact</label>
              <input type="text" value={form.impact} onChange={set('impact')}
                className={inputCls('impact')} />
            </div>

            {/* Steps to Reproduce */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Steps to Reproduce</label>
              <textarea value={form.stepsToReproduce} onChange={set('stepsToReproduce')} rows={4}
                className={inputCls('stepsToReproduce')} />
            </div>

            {/* Additional Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Info</label>
              <textarea value={form.additionalInfo} onChange={set('additionalInfo')} rows={3}
                className={inputCls('additionalInfo')} />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              {originalStatus && (
                <p className="text-xs text-gray-400 mb-1">Current: <strong>{originalStatus}</strong></p>
              )}
              <select value={form.status} onChange={set('status')}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.status || statusError ? 'border-red-400' : 'border-gray-300'
                }`}>
                <option value="">Select status…</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
              {statusError && (
                <div className="mt-2 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">
                  {statusError}
                </div>
              )}
            </div>

            {/* Conditional date fields */}
            {(form.status === 'Open' || form.status === 'In Progress') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Fix Date <span className="text-red-500">*</span>
                  <span className="text-gray-400 font-normal ml-1">(MM/DD)</span>
                </label>
                <input type="text" value={form.estimatedFixDate} onChange={set('estimatedFixDate')}
                  className={inputCls('estimatedFixDate')} placeholder="e.g. 04/15" />
                {errors.estimatedFixDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.estimatedFixDate}</p>
                )}
              </div>
            )}

            {form.status === 'Fixed' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Fixed <span className="text-red-500">*</span>
                  <span className="text-gray-400 font-normal ml-1">(MM/DD)</span>
                </label>
                <input type="text" value={form.fixedDate} onChange={set('fixedDate')}
                  className={inputCls('fixedDate')} placeholder="e.g. 04/10" />
                {errors.fixedDate && <p className="text-red-500 text-xs mt-1">{errors.fixedDate}</p>}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/bug/${id}`)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
