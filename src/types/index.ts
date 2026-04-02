import type { Timestamp } from 'firebase/firestore'

export interface UserProfile {
  uid: string
  name: string
  email: string
  contactInfo: string
  role: string
  createdAt: Timestamp
}

export interface BugReporter {
  uid: string
  name: string
  role: string
  contactInfo: string
}

export interface Bug {
  id: string
  title: string
  reportedBy: BugReporter
  dateFound: string       // "MM/DD HH:mm"
  bugType: string
  description: string
  priority: 'High' | 'Medium' | 'Low'
  affectedFiles: string
  impact: string
  stepsToReproduce: string
  additionalInfo: string
  status: 'Open' | 'In Progress' | 'Fixed'
  estimatedFixDate: string  // MM/DD — set when Open or In Progress
  fixedDate: string         // MM/DD — set when Fixed
  createdAt: Timestamp
  updatedAt: Timestamp
}

export const BUG_TYPES = [
  'Product Backlog Item',
  'Design Document',
  'Diagram',
  'Formal Spec',
  'Source File',
  'Test Source File',
  'Binary',
  'Data File',
] as const

export const ROLES = [
  'Developer',
  'Tester',
  'Analyst',
  'Client',
  'Team Leader',
] as const

export const PRIORITIES = ['High', 'Medium', 'Low'] as const
export const STATUSES = ['Open', 'In Progress', 'Fixed'] as const

// Returns null if transition is valid, error string if invalid
export function validateStatusTransition(
  from: string,
  to: string
): string | null {
  if (from === to) return null
  const invalid: Record<string, string[]> = {
    'Open': ['Fixed'],
    'Fixed': ['In Progress'],
  }
  if (invalid[from]?.includes(to)) {
    return `Status cannot go directly from "${from}" to "${to}". ${
      from === 'Open'
        ? 'Open must go to In Progress before Fixed.'
        : 'Fixed can only be reopened to Open.'
    }`
  }
  return null
}
