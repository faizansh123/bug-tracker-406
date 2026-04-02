import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { BUG_TYPES, PRIORITIES, STATUSES } from '../types'
import Navbar from '../components/Navbar'
import DuplicateWarningModal from '../components/DuplicateWarningModal'

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

const EMPTY: FormState = {
  title: '',
  dateFound: '',
  bugType: '',
  description: '',
  priority: '',
  affectedFiles: '',
  impact: '',
  stepsToReproduce: '',
  additionalInfo: '',
  status: '',
  estimatedFixDate: '',
  fixedDate: '',
}

export default function ReportBug() {
  const navigate = useNavigate()
  const { userProfile } = useAuth()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [duplicateTitle, setDuplicateTitle] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [pendingSave, setPendingSave] = useState(false)

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }))

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

  const checkDuplicate = async (): Promise<string> => {
    const titleLower = form.title.trim().toLowerCase()
    const snap = await getDocs(collection(db, 'bugs'))
    const match = snap.docs.find((d) =>
      (d.data().title as string).toLowerCase() === titleLower
    )
    return match ? (match.data().title as string) : ''
  }

  const saveBug = async () => {
    setLoading(true)
    setServerError('')
    try {
      await addDoc(collection(db, 'bugs'), {
        title: form.title.trim(),
        reportedBy: {
          uid: userProfile!.uid,
          name: userProfile!.name,
          role: userProfile!.role,
          contactInfo: userProfile!.contactInfo,
        },
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      navigate('/dashboard')
    } catch {
      setServerError('Failed to save bug. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const match = await checkDuplicate()
      if (match && !pendingSave) {
        setDuplicateTitle(match)
        setShowModal(true)
        setLoading(false)
        return
      }
    } catch {
      setServerError('Failed to check for duplicates.')
      setLoading(false)
      return
    }
    setLoading(false)
    await saveBug()
  }

  const handleConfirmDuplicate = async () => {
    setShowModal(false)
    setPendingSave(true)
    await saveBug()
  }

  const inputCls = (field: keyof FormState) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
      errors[field] ? 'border-red-400' : 'border-gray-300'
    }`

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {showModal && (
        <DuplicateWarningModal
          matchingTitle={duplicateTitle}
          onConfirm={handleConfirmDuplicate}
          onCancel={() => setShowModal(false)}
        />
      )}

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Report a Bug</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fill in the details below to submit a new bug report.</p>
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
                className={inputCls('title')} placeholder="Brief description of the bug" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Date Found */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Found <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-1">(MM/DD HH:mm)</span>
              </label>
              <input type="text" value={form.dateFound} onChange={set('dateFound')}
                className={inputCls('dateFound')} placeholder="e.g. 04/01 14:30" />
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
                className={inputCls('description')} placeholder="Describe what the bug is…" />
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
                className={inputCls('affectedFiles')} placeholder="e.g. src/auth/login.tsx" />
            </div>

            {/* Impact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Impact</label>
              <input type="text" value={form.impact} onChange={set('impact')}
                className={inputCls('impact')} placeholder="What does this bug affect?" />
            </div>

            {/* Steps to Reproduce */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Steps to Reproduce</label>
              <textarea value={form.stepsToReproduce} onChange={set('stepsToReproduce')} rows={4}
                className={inputCls('stepsToReproduce')} placeholder="1. Go to…&#10;2. Click on…&#10;3. See error" />
            </div>

            {/* Additional Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Info</label>
              <textarea value={form.additionalInfo} onChange={set('additionalInfo')} rows={3}
                className={inputCls('additionalInfo')} placeholder="Any other relevant information…" />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select value={form.status} onChange={set('status')} className={inputCls('status')}>
                <option value="">Select status…</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
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
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
              >
                {loading ? 'Saving…' : 'Submit Bug Report'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
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
