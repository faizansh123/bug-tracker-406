interface Props {
  matchingTitle: string
  onConfirm: () => void
  onCancel: () => void
}

export default function DuplicateWarningModal({ matchingTitle, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 bg-yellow-100 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Duplicate Bug Title</h2>
        </div>

        <p className="text-sm text-gray-600 mb-2">
          A bug with a similar title already exists:
        </p>
        <p className="text-sm font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 mb-6 break-words">
          "{matchingTitle}"
        </p>
        <p className="text-sm text-gray-600 mb-6">
          Do you want to continue and save this bug anyway?
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Go Back and Edit
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Save Anyway
          </button>
        </div>
      </div>
    </div>
  )
}
